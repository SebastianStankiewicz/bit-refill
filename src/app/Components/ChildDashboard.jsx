import React, { useState, useEffect } from "react";
import MessageBox from "./MessageBox"; // Import MessageBox
import Tasks from "./Child/Tasks";
import Store from "./Child/Store";
function ChildDashboard({ supabase, userId, familyId, onSignOut }) {
  const [family, setFamily] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [xpBalance, setXpBalance] = useState(0);
  const [message, setMessage] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]); // To show child their pending requests

  const [selectTab, setSelectTab] = useState("Pending");

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
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50 font-sans w-full">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Child Dashboard: {family.family_name}
        </h1>
        <p className="text-lg text-gray-600">
          Your XP Balance:{" "}
          <span className="font-extrabold text-purple-700">{xpBalance} XP</span>
        </p>
        <p className="text-sm text-gray-500">
          Your User ID:{" "}
          <span className="font-mono text-gray-700 break-all">{userId}</span>
        </p>

        {selectTab === "Store" ? (
          <Store handleSpendXp={null} />
        ) : selectTab === "Tasks" ? (
          <Tasks supabase={supabase} familyId={familyId} tasks={tasks} pendingRequests={pendingRequests} handleRequestXp={handleRequestXp} />
        ) : null}

        <div className="flex flex-row justify-around border-b border-gray-200 mb-6 bg-gray-50 rounded-t-lg shadow-inner">
          <button
            className={`flex-1 py-3 text-lg font-semibold transition-colors duration-200 ${
              selectTab === "Tasks"
                ? "text-blue-700 border-b-2 border-blue-700 bg-white shadow-sm"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
            onClick={() => setSelectTab("Tasks")}
          >
            Tasks ({tasks.length})
          </button>
          <button
            className={`flex-1 py-3 text-lg font-semibold rounded-tr-lg transition-colors duration-200 ${
              selectTab === "Store"
                ? "text-blue-700 border-b-2 border-blue-700 bg-white shadow-sm"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
            onClick={() => setSelectTab("Store")}
          >
            Shop
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChildDashboard;
