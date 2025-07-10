import React, { useState, useEffect } from "react";
import Image from "next/image";
import MessageBox from "./MessageBox";
import Tasks from "./Child/Tasks";
import Store from "./Child/Store";
function ChildDashboard({ supabase, userId, familyId, onSignOut }) {
  const [family, setFamily] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [xpBalance, setXpBalance] = useState(0);
  const [message, setMessage] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]); // To show child their pending requests

  const [selectTab, setSelectTab] = useState("Tasks");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase || !familyId) return;

    // Fetch family data
    const fetchFamily = async () => {
      const { data, error } = await supabase
        .from("families")
        .select("*")
        .eq("id", familyId)
        .single();
      if (error) {
        console.error("Error fetching family:", error.message);
        setFamily(null);
      } else {
        setFamily(data);
      }
    };

    const fetchTasks = async (userId) => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", familyId)
        .eq("assigned_child_uid", userId);;
      if (error) console.error("Error fetching tasks:", error.message);
      else setTasks(data || []);
    };

    fetchTasks(userId);
    fetchFamily();

    // Realtime listener for tasks
    const tasksChannel = supabase
      .channel("tasks_changes_child")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          fetchTasks();
        }
      )
      .subscribe();




    // Realtime listener for child's profile for XP balance
    const profileChannel = supabase
      .channel("child_profile_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "children",
          filter: `auth_uid=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.auth_uid === userId) {
            setXpBalance(payload.new.xp_balance || 0);
          }
        }
      )
      .subscribe();

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("children")
        .select("xp_balance")
        .eq("auth_uid", userId)
        .single();
      if (error) console.error("Error fetching profile:", error.message);
      else setXpBalance(data ? data.xp_balance || 0 : 0);
    };
    fetchProfile();

    // Realtime listener for child's pending XP requests
    const xpRequestsChannel = supabase
      .channel("xp_requests_changes_child")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "xp_requests",
          filter: `child_auth_uid=eq.${userId}`,
        },
        (payload) => {
          fetchPendingRequests();
        }
      )
      .subscribe();

    const fetchPendingRequests = async () => {
      const { data, error } = await supabase
        .from("xp_requests")
        .select("*")
        .eq("family_id", familyId)
        .eq("child_auth_uid", userId)
        .eq("status", "pending");
      if (error)
        console.error("Error fetching pending requests:", error.message);
      else setPendingRequests(data || []);
    };
    fetchPendingRequests();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(xpRequestsChannel);
    };
  }, [supabase, userId, familyId]);

  const handleRequestXp = async (task) => {
    // Check if there's already a pending request for this task by this child
    const existingRequest = pendingRequests.find(
      (req) => req.task_id === task.id
    );
    if (existingRequest) {
      setMessage({
        text: "You already have a pending XP request for this task.",
        type: "info",
      });
      return;
    }

    try {
      const { error } = await supabase.from("xp_requests").insert({
        family_id: familyId,
        task_id: task.id,
        child_auth_uid: userId, // Use auth_uid
        requested_xp: task.xp_value,
        status: "pending",
      });

      if (error) throw error;
      setPendingRequests((prev) => [
        ...prev,
        {
          id: Date.now(), // Temporary ID (can be replaced by real one later)
          task_id: task.id,
          child_auth_uid: userId,
          requested_xp: task.xp_value,
          status: "pending",
          family_id: familyId,
        },
      ]);
      
      setMessage({
        text: `XP request for "${task.description}" submitted!`,
        type: "info",
      });
    } catch (error) {
      console.error("Error requesting XP:", error.message);
      setMessage({
        text: "Failed to submit XP request. " + error.message,
        type: "error",
      });
    }
  };

  const handleSpendXp = async () => {
    if (xpBalance < 100) {
      // Example threshold for spending
      setMessage({
        text: "You need at least 100 XP to redeem a gift card.",
        type: "error",
      });
      return;
    }

    setMessage({ text: "Redeeming gift card...", type: "info" });
    try {
      // --- MOCK Bitrefill API Call (Next.js API Route) ---
      const response = await fetch("/api/mock-bitrefill-redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, xpToRedeem: 100 }), // Example: redeem 100 XP
      });
      const result = await response.json();

      if (result.success) {
        // Deduct XP from balance in the children table
        const { error: xpUpdateError } = await supabase
          .from("children")
          .update({ xp_balance: xpBalance - 100 })
          .eq("auth_uid", userId); // Update by auth_uid

        if (xpUpdateError) throw xpUpdateError;
        setMessage({
          text: `Gift card redeemed successfully! Remaining XP: ${
            xpBalance - 100
          }`,
          type: "info",
        });
      } else {
        setMessage({
          text: `Gift card redemption failed: ${result.message}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error spending XP:", error.message);
      setMessage({
        text: "Failed to redeem gift card. " + error.message,
        type: "error",
      });
    }
  };

  if (!family) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading family data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Image
              src="/bitrefill-logo.svg"
              alt="Bitrefill Logo"
              width={120}
              height={36}
              className="h-6 w-auto"
            />
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-1 rounded-full">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-bold text-purple-700">{xpBalance} XP</span>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white p-4 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-gray-800">{family?.family_name}</h2>
              <p className="text-sm text-gray-600">Child Dashboard</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">User ID: {userId.slice(0, 8)}...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 bg-white shadow-lg border-r border-gray-200">
          <div className="w-full p-6 space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Image
                  src="/bitrefill-logo.svg"
                  alt="Bitrefill Logo"
                  width={150}
                  height={45}
                  className="h-8 w-auto"
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#002B28] to-[#004540] bg-clip-text text-transparent">
                  {family?.family_name || "Loading..."}
                </h1>
                <p className="text-sm text-gray-600">Child Dashboard</p>
              </div>
            </div>

            {/* XP Balance Card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Your XP Balance</p>
                  <p className="text-xl font-bold text-purple-800">{xpBalance} XP</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">User ID</p>
              <p className="text-sm font-mono text-gray-700 break-all">{userId}</p>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-2">
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectTab === "Tasks"
                    ? "bg-[#002B28] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
                onClick={() => setSelectTab("Tasks")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Tasks</span>
                <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {tasks.length}
                </span>
              </button>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectTab === "Store"
                    ? "bg-[#002B28] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
                onClick={() => setSelectTab("Store")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Shop</span>
              </button>
            </div>

            {/* Sign Out Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Message Display */}
            {message && (
              <div className="mb-6">
                <MessageBox message={message} onClose={() => setMessage(null)} />
              </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {selectTab === "Tasks" && (
                <Tasks 
                  supabase={supabase} 
                  familyId={familyId} 
                  tasks={tasks} 
                  pendingRequests={pendingRequests} 
                  handleRequestXp={handleRequestXp} 
                />
              )}
              {selectTab === "Store" && (
                <Store handleSpendXp={handleSpendXp} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex">
          <button
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors duration-200 ${
              selectTab === "Tasks"
                ? "text-[#002B28] bg-green-50"
                : "text-gray-600"
            }`}
            onClick={() => setSelectTab("Tasks")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-medium">Tasks</span>
            {tasks.length > 0 && (
              <span className="absolute -top-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {tasks.length}
              </span>
            )}
          </button>
          <button
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors duration-200 ${
              selectTab === "Store"
                ? "text-[#002B28] bg-green-50"
                : "text-gray-600"
            }`}
            onClick={() => setSelectTab("Store")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs font-medium">Shop</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChildDashboard;
