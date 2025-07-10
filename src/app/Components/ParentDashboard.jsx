import React, { useState, useEffect } from "react";
import Image from "next/image";
import MessageBox from "./MessageBox";
import Store from "./Parent/Store";
import Tasks from "./Parent/Tasks";
import Pending from "./Parent/Pending";

function ParentDashboard({ supabase, userId, familyId, onSignOut }) {
  const [family, setFamily] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [xpRequests, setXpRequests] = useState([]);
  const [childrenNames, setChildrenNames] = useState({}); // Map auth_uid to child name
  const [message, setMessage] = useState(null);

  const [selectTab, setSelectTab] = useState("Pending");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  //Has been pushed to git so will change after testing and remove hard coding
  const [bitRefillAPI, setBitRefillAPI] = useState(
    ""
  );

  const [children, setChildren] = useState([]);

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

    const fetchChildren = async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("family_id", familyId);

      if (error) {
        console.error("Error fetching children:", error.message);
      } else {
        setChildren(data || []);
      }
    };

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          xp_requests(status)
        `
        )
        .eq("family_id", familyId);

      if (error) {
        console.error("Error fetching tasks:", error.message);
        return;
      }

      // Filter out tasks with an approved XP request
      const filteredTasks = (data || []).filter((task) => {
        // If no xp_requests or none are approved, keep the task
        const requests = task.xp_requests || [];
        return !requests.some((req) => req.status === "approved");
      });

      setTasks(filteredTasks);
    };
    fetchFamily();
    fetchTasks();
    fetchChildren();

    // Realtime listener for tasks
    const tasksChannel = supabase
      .channel("tasks_changes")
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

    // Realtime listener for XP requests
    const xpRequestsChannel = supabase
      .channel("xp_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "xp_requests",
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          fetchXpRequests();
        }
      )
      .subscribe();

    const fetchXpRequests = async () => {
      const { data, error } = await supabase
        .from("xp_requests")
        .select("*")
        .eq("family_id", familyId)
        .eq("status", "pending"); // Only pending requests
      if (error) console.error("Error fetching XP requests:", error.message);
      else {
        setXpRequests(data || []);

        // Fetch child names for requests
        const childAuthUids = [
          ...new Set((data || []).map((req) => req.child_auth_uid)),
        ];
        childAuthUids.forEach(async (childAuthUid) => {
          if (!childrenNames[childAuthUid]) {
            const { data: childProfile, error: profileError } = await supabase
              .from("children")
              .select("name")
              .eq("auth_uid", childAuthUid)
              .single();
            if (profileError)
              console.error("Error fetching child name:", profileError.message);
            else if (childProfile) {
              setChildrenNames((prev) => ({
                ...prev,
                [childAuthUid]: childProfile.name,
              }));
            }
          }
        });
      }
    };

    fetchXpRequests();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(xpRequestsChannel);
    };
  }, [supabase, userId, familyId, childrenNames]);

  const handleUpdateXpRequest = async (
    requestId,
    childAuthUid,
    xpValue,
    status
  ) => {
    try {
      const { error: requestUpdateError } = await supabase
        .from("xp_requests")
        .update({ status: status, processed_at: new Date().toISOString() })
        .eq("id", requestId);

      if (requestUpdateError) throw requestUpdateError;

      if (status === "approved") {
        // Find the child's record by auth_uid to update their xp_balance
        const { data: childRecord, error: childRecordFetchError } =
          await supabase
            .from("children")
            .select("xp_balance")
            .eq("auth_uid", childAuthUid)
            .single();

        if (childRecordFetchError) throw childRecordFetchError;

        const currentXp = childRecord ? childRecord.xp_balance || 0 : 0;
        const { error: xpUpdateError } = await supabase
          .from("children")
          .update({ xp_balance: currentXp + xpValue })
          .eq("auth_uid", childAuthUid); // Update by auth_uid

        if (xpUpdateError) throw xpUpdateError;
      }
      setXpRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error("Error updating XP request:", error.message);
      setMessage({
        text: "Failed to update XP request. " + error.message,
        type: "error",
      });
    }
  };

  const handleDeleteTask = async (requestId) => {
    console.log("Delete task here", requestId);
  
    const { data: updateData, error: requestUpdateError } = await supabase
      .from("xp_requests")
      .update({
        status: "approved",
        processed_at: new Date().toISOString(),
      })
      .eq("task_id", requestId)
      .select(); // select() lets us check if any row was updated
  
    if (requestUpdateError) throw requestUpdateError;

    console.log(updateData);
  
    // If nothing was updated, insert a new row instead
    if (!updateData || updateData.length === 0) {
      const { error: insertError } = await supabase.from("xp_requests").insert({
        family_id: null,
        task_id: requestId,
        child_auth_uid: null,
        requested_xp: null,
        status: "approved",
      });
  
      if (insertError) throw insertError;
    }
  
    // Remove from local state
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== requestId));
  };
  

  if (!family) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading family data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/bitrefill-logo.svg"
              alt="Bitrefill Logo"
              width={120}
              height={36}
              className="h-6 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {family ? family.family_name : "Loading..."}
              </h1>
              <p className="text-xs text-gray-600">Parent Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Family Code
                </p>
                <p className="font-mono text-sm text-[#002B28] font-semibold">
                  {family.family_code}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  User ID
                </p>
                <p className="font-mono text-xs text-gray-600 truncate">
                  {userId.substring(0, 8)}...
                </p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      <div className="flex min-h-screen lg:min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-lg p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <Image
                src="/bitrefill-logo.svg"
                alt="Bitrefill Logo"
                width={150}
                height={45}
                className="h-8 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {family ? family.family_name : "Loading..."}
            </h1>
            <p className="text-sm text-gray-600">Parent Dashboard</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Family Code
              </p>
              <p className="font-mono text-[#002B28] font-semibold">
                {family.family_code}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Your User ID
              </p>
              <p className="font-mono text-xs text-gray-600 break-all">
                {userId}
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setSelectTab("Pending")}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                selectTab === "Pending"
                  ? "bg-[#002B28] text-white border-l-4 border-[#004540]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              ⏳ Approvals ({xpRequests.length})
            </button>
            <button
              onClick={() => setSelectTab("Tasks")}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                selectTab === "Tasks"
                  ? "bg-[#002B28] text-white border-l-4 border-[#004540]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              📋 Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setSelectTab("Store")}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                selectTab === "Store"
                  ? "bg-[#002B28] text-white border-l-4 border-[#004540]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              🏪 Store
            </button>
          </nav>

          <button
            onClick={onSignOut}
            className="w-full mt-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 min-h-full">
            {selectTab === "Store" ? (
              <Store apiKey={bitRefillAPI} />
            ) : selectTab === "Tasks" ? (
              <Tasks
                supabase={supabase}
                familyId={familyId}
                childrenNames={children}
                tasks={tasks}
                setTasks={setTasks}
                handleDeleteTask={handleDeleteTask}
              />
            ) : selectTab === "Pending" ? (
              <Pending
                xpRequests={xpRequests}
                childrenNames={childrenNames}
                tasks={tasks}
                handleUpdateXpRequest={handleUpdateXpRequest}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button
            onClick={() => setSelectTab("Pending")}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              selectTab === "Pending"
                ? "bg-[#002B28] text-white"
                : "text-gray-600"
            }`}
          >
            <span className="text-lg mb-1">⏳</span>
            <span className="text-xs font-medium">Approvals</span>
            <span className="text-xs">({xpRequests.length})</span>
          </button>
          <button
            onClick={() => setSelectTab("Tasks")}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              selectTab === "Tasks"
                ? "bg-[#002B28] text-white"
                : "text-gray-600"
            }`}
          >
            <span className="text-lg mb-1">📋</span>
            <span className="text-xs font-medium">Tasks</span>
            <span className="text-xs">({tasks.length})</span>
          </button>
          <button
            onClick={() => setSelectTab("Store")}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              selectTab === "Store"
                ? "bg-[#002B28] text-white"
                : "text-gray-600"
            }`}
          >
            <span className="text-lg mb-1">🏪</span>
            <span className="text-xs font-medium">Store</span>
          </button>
        </div>
      </div>

      {/* Add bottom padding on mobile to account for fixed navigation */}
      <div className="lg:hidden h-20"></div>

      {message && (
        <MessageBox
          message={message.text}
          type={message.type}
          onConfirm={() => setMessage(null)}
        />
      )}
    </div>
  );
}

export default ParentDashboard;
