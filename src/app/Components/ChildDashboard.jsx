import React, { useState, useEffect } from 'react';
import MessageBox from './MessageBox'; // Import MessageBox

function ChildDashboard({ supabase, userId, familyId, onSignOut }) {
  const [family, setFamily] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [xpBalance, setXpBalance] = useState(0);
  const [message, setMessage] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]); // To show child their pending requests

  useEffect(() => {
    if (!supabase || !familyId) return;

    // Fetch family data
    const fetchFamily = async () => {
      const { data, error } = await supabase.from('families').select('*').eq('id', familyId).single();
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
      .channel('tasks_changes_child')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `family_id=eq.${familyId}` }, payload => {
        fetchTasks();
      })
      .subscribe();

    const fetchTasks = async () => {
      const { data, error } = await supabase.from('tasks').select('*').eq('family_id', familyId);
      if (error) console.error("Error fetching tasks:", error.message);
      else setTasks(data || []);
    };
    fetchTasks();

    // Realtime listener for child's profile for XP balance
    const profileChannel = supabase
      .channel('child_profile_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'children', filter: `auth_uid=eq.${userId}` }, payload => {
        if (payload.new.auth_uid === userId) {
          setXpBalance(payload.new.xp_balance || 0);
        }
      })
      .subscribe();

    const fetchProfile = async () => {
      const { data, error } = await supabase.from('children').select('xp_balance').eq('auth_uid', userId).single();
      if (error) console.error("Error fetching profile:", error.message);
      else setXpBalance(data ? data.xp_balance || 0 : 0);
    };
    fetchProfile();

    // Realtime listener for child's pending XP requests
    const xpRequestsChannel = supabase
      .channel('xp_requests_changes_child')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'xp_requests', filter: `child_auth_uid=eq.${userId}` }, payload => {
        fetchPendingRequests();
      })
      .subscribe();

    const fetchPendingRequests = async () => {
      const { data, error } = await supabase
        .from('xp_requests')
        .select('*')
        .eq('family_id', familyId)
        .eq('child_auth_uid', userId)
        .eq('status', 'pending');
      if (error) console.error("Error fetching pending requests:", error.message);
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
    const existingRequest = pendingRequests.find(req => req.task_id === task.id);
    if (existingRequest) {
      setMessage({ text: "You already have a pending XP request for this task.", type: "info" });
      return;
    }

    try {
      const { error } = await supabase
        .from('xp_requests')
        .insert({
          family_id: familyId,
          task_id: task.id,
          child_auth_uid: userId, // Use auth_uid
          requested_xp: task.xp_value,
          status: "pending",
        });

      if (error) throw error;
      setMessage({ text: `XP request for "${task.description}" submitted!`, type: "info" });
    } catch (error) {
      console.error("Error requesting XP:", error.message);
      setMessage({ text: "Failed to submit XP request. " + error.message, type: "error" });
    }
  };

  const handleSpendXp = async () => {
    if (xpBalance < 100) { // Example threshold for spending
      setMessage({ text: "You need at least 100 XP to redeem a gift card.", type: "error" });
      return;
    }

    setMessage({ text: "Redeeming gift card...", type: "info" });
    try {
      // --- MOCK Bitrefill API Call (Next.js API Route) ---
      const response = await fetch('/api/mock-bitrefill-redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, xpToRedeem: 100 }), // Example: redeem 100 XP
      });
      const result = await response.json();

      if (result.success) {
        // Deduct XP from balance in the children table
        const { error: xpUpdateError } = await supabase
          .from('children')
          .update({ xp_balance: xpBalance - 100 })
          .eq('auth_uid', userId); // Update by auth_uid

        if (xpUpdateError) throw xpUpdateError;
        setMessage({ text: `Gift card redeemed successfully! Remaining XP: ${xpBalance - 100}`, type: "info" });
      } else {
        setMessage({ text: `Gift card redemption failed: ${result.message}`, type: "error" });
      }
    } catch (error) {
      console.error("Error spending XP:", error.message);
      setMessage({ text: "Failed to redeem gift card. " + error.message, type: "error" });
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Child Dashboard: {family.family_name}</h1>
        <p className="text-lg text-gray-600">Your XP Balance: <span className="font-extrabold text-purple-700">{xpBalance} XP</span></p>
        <p className="text-sm text-gray-500">Your User ID: <span className="font-mono text-gray-700 break-all">{userId}</span></p>

        {/* Tasks */}
        <div className="border p-6 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800">Your Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-600">No tasks available from your parent yet.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map(task => {
                const isPending = pendingRequests.some(req => req.task_id === task.id);
                return (
                  <li key={task.id} className="p-3 bg-gray-50 rounded-md border flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{task.description}</p>
                      <span className="text-blue-600 text-sm">{task.xp_value} XP</span>
                    </div>
                    {isPending ? (
                      <span className="text-yellow-600 font-semibold">Pending...</span>
                    ) : (
                      <button
                        onClick={() => handleRequestXp(task)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
                      >
                        Request XP
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Spend XP */}
        <div className="border p-6 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800">Spend Your XP</h2>
          <p className="text-gray-600">Redeem 100 XP for a mock gift card.</p>
          <button
            onClick={handleSpendXp}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            Redeem Gift Card (Mock)
          </button>
        </div>

        <button
          onClick={onSignOut}
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors font-semibold mt-8"
        >
          Sign Out
        </button>
      </div>
      {message && <MessageBox message={message.text} type={message.type} onConfirm={() => setMessage(null)} />}
    </div>
  );
}

export default ChildDashboard;