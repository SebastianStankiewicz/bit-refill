import React, { useState, useEffect } from "react";
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
  const [bitRefillAPI, setBitRefillAPI] = useState('');



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
    fetchFamily();

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

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", familyId);
      if (error) console.error("Error fetching tasks:", error.message);
      else setTasks(data || []);
    };
    fetchTasks();

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
      setMessage({ text: `XP request ${status}!`, type: "info" });
    } catch (error) {
      console.error("Error updating XP request:", error.message);
      setMessage({
        text: "Failed to update XP request. " + error.message,
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
          Parent Dashboard: {family.family_name}
        </h1>
        <p className="text-lg text-gray-600">
          Family Code:{" "}
          <span className="font-mono text-blue-700">{family.family_code}</span>
        </p>
        <p className="text-sm text-gray-500">
          Your User ID:{" "}
          <span className="font-mono text-gray-700 break-all">{userId}</span>
        </p>

        {selectTab === "Store" ? (
          <Store apiKey={bitRefillAPI} />
        ) : selectTab === "Tasks" ? (
          <Tasks supabase={supabase} familyId={familyId} tasks={tasks} />
        ) : selectTab === "Pending" ? (
          <Pending xpRequests={xpRequests} childrenNames={childrenNames} tasks={tasks} handleUpdateXpRequest={handleUpdateXpRequest} />
        ) : null}

        {/*Tab bar here */}
        <div className="flex flex-row justify-around border-b border-gray-200 mb-6 bg-gray-50 rounded-t-lg shadow-inner">
          <button
            className={`flex-1 py-3 text-lg font-semibold rounded-tl-lg transition-colors duration-200 ${
              selectTab === "Pending"
                ? "text-blue-700 border-b-2 border-blue-700 bg-white shadow-sm"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
            onClick={() => setSelectTab("Pending")}
          >
            Approvals ({xpRequests.length})
          </button>
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
