import React, { useState, useEffect } from 'react';
import MessageBox from './MessageBox';

function ParentDashboard({ supabase, userId, familyId, onSignOut }) {
  const [family, setFamily] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskDescription, setNewTaskDescription] = useState(''); // Changed from name to description
  const [newTaskXp, setNewTaskXp] = useState(10);
  const [xpRequests, setXpRequests] = useState([]);
  const [childrenNames, setChildrenNames] = useState({}); // Map auth_uid to child name
  const [message, setMessage] = useState(null);

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
      .channel('tasks_changes')
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

    // Realtime listener for XP requests
    const xpRequestsChannel = supabase
      .channel('xp_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'xp_requests', filter: `family_id=eq.${familyId}` }, payload => {
        fetchXpRequests();
      })
      .subscribe();

    const fetchXpRequests = async () => {
      const { data, error } = await supabase
        .from('xp_requests')
        .select('*')
        .eq('family_id', familyId)
        .eq('status', 'pending'); // Only pending requests
      if (error) console.error("Error fetching XP requests:", error.message);
      else {
        setXpRequests(data || []);

        // Fetch child names for requests
        const childAuthUids = [...new Set((data || []).map(req => req.child_auth_uid))];
        childAuthUids.forEach(async (childAuthUid) => {
          if (!childrenNames[childAuthUid]) {
            const { data: childProfile, error: profileError } = await supabase
              .from('children')
              .select('name')
              .eq('auth_uid', childAuthUid)
              .single();
            if (profileError) console.error("Error fetching child name:", profileError.message);
            else if (childProfile) {
              setChildrenNames(prev => ({ ...prev, [childAuthUid]: childProfile.name }));
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

  const handleAddTask = async () => {
    if (!newTaskDescription.trim() || newTaskXp <= 0) {
      setMessage({ text: "Please enter a valid task description and XP value.", type: "error" });
      return;
    }
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          family_id: familyId,
          description: newTaskDescription.trim(),
          xp_value: Number(newTaskXp),
        });

      if (error) throw error;

      setNewTaskDescription('');
      setNewTaskXp(10);
      setMessage({ text: "Task added successfully!", type: "info" });
    } catch (error) {
      console.error("Error adding task:", error.message);
      setMessage({ text: "Failed to add task. " + error.message, type: "error" });
    }
  };

  const handleUpdateXpRequest = async (requestId, childAuthUid, xpValue, status) => {
    try {
      const { error: requestUpdateError } = await supabase
        .from('xp_requests')
        .update({ status: status, processed_at: new Date().toISOString() })
        .eq('id', requestId);

      if (requestUpdateError) throw requestUpdateError;

      if (status === 'approved') {
        // Find the child's record by auth_uid to update their xp_balance
        const { data: childRecord, error: childRecordFetchError } = await supabase
          .from('children')
          .select('xp_balance')
          .eq('auth_uid', childAuthUid)
          .single();

        if (childRecordFetchError) throw childRecordFetchError;

        const currentXp = childRecord ? childRecord.xp_balance || 0 : 0;
        const { error: xpUpdateError } = await supabase
          .from('children')
          .update({ xp_balance: currentXp + xpValue })
          .eq('auth_uid', childAuthUid); // Update by auth_uid

        if (xpUpdateError) throw xpUpdateError;
      }
      setMessage({ text: `XP request ${status}!`, type: "info" });
    } catch (error) {
      console.error("Error updating XP request:", error.message);
      setMessage({ text: "Failed to update XP request. " + error.message, type: "error" });
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Parent Dashboard: {family.family_name}</h1>
        <p className="text-lg text-gray-600">Family Code: <span className="font-mono text-blue-700">{family.family_code}</span></p>
        <p className="text-sm text-gray-500">Your User ID: <span className="font-mono text-gray-700 break-all">{userId}</span></p>

        {/* Add New Task */}
        <div className="border p-6 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800">Add New Task</h2>
          <input
            type="text"
            placeholder="Task Description (e.g., Do the dishes)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="XP Value"
            value={newTaskXp}
            onChange={(e) => setNewTaskXp(Number(e.target.value))}
            min="1"
            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddTask}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Add Task
          </button>
        </div>

        {/* Pending XP Requests */}
        <div className="border p-6 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800">Pending XP Requests ({xpRequests.length})</h2>
          {xpRequests.length === 0 ? (
            <p className="text-gray-600">No pending requests.</p>
          ) : (
            <ul className="space-y-3">
              {xpRequests.map(req => (
                <li key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                  <div>
                    <p className="font-semibold">{childrenNames[req.child_auth_uid] || req.child_auth_uid.substring(0, 8)} requested {req.requested_xp} XP for "{tasks.find(t => t.id === req.task_id)?.description || 'Unknown Task'}"</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleUpdateXpRequest(req.id, req.child_auth_uid, req.requested_xp, 'approved')}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateXpRequest(req.id, req.child_auth_uid, 0, 'denied')}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                    >
                      Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Existing Tasks */}
        <div className="border p-6 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800">Your Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-600">No tasks created yet.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map(task => (
                <li key={task.id} className="p-3 bg-gray-50 rounded-md border flex justify-between items-center">
                  <p className="font-semibold">{task.description}</p>
                  <span className="text-blue-600">{task.xp_value} XP</span>
                </li>
              ))}
            </ul>
          )}
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

export default ParentDashboard;