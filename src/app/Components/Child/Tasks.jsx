import React from 'react'

function Tasks({supabase, familyId, tasks, pendingRequests, handleRequestXp}) {
  return (
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
  )
}

export default Tasks