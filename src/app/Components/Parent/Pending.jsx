import React, {useState} from 'react'

function Pending({xpRequests, childrenNames, tasks, handleUpdateXpRequest}) {
    const [newTaskXp, setNewTaskXp] = useState(10);
  return (
    <div>
        <div className="border p-6 rounded-lg space-y-4 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800">
            Pending XP Requests ({xpRequests.length})
          </h2>
          {xpRequests.length === 0 ? (
            <p className="text-gray-600">No pending requests.</p>
          ) : (
            <ul className="space-y-3">
              {xpRequests.map((req) => (
                <li
                  key={req.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                >
                  <div>
                    <p className="font-semibold">
                      {childrenNames[req.child_auth_uid] ||
                        req.child_auth_uid.substring(0, 8)}{" "}
                      requested {req.requested_xp} XP for "
                      {tasks.find((t) => t.id === req.task_id)?.description ||
                        "Unknown Task"}
                      "
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() =>
                        handleUpdateXpRequest(
                          req.id,
                          req.child_auth_uid,
                          req.requested_xp,
                          "approved"
                        )
                      }
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateXpRequest(
                          req.id,
                          req.child_auth_uid,
                          0,
                          "denied"
                        )
                      }
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
    </div>
  )
}

export default Pending