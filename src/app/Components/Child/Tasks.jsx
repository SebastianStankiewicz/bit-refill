import React from 'react'

function Tasks({supabase, familyId, tasks, pendingRequests, handleRequestXp}) {
  return (
    <div className="w-full h-full">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#002B28] to-[#004540] bg-clip-text text-transparent">
              Your Tasks
            </h1>
            <p className="text-gray-600">Complete tasks to earn XP rewards</p>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#002B28] rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Available Tasks</h2>
              <p className="text-gray-600">{tasks.length} tasks available</p>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks available</h3>
                <p className="text-gray-500">Check back later for new tasks from your parent</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => {
                  const isPending = pendingRequests.some(req => req.task_id === task.id);
                  return (
                    <div key={task.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-[#002B28]/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900">{task.description}</h3>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-[#002B28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="text-lg font-bold text-[#002B28]">{task.xp_value} XP</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                              <span className="text-yellow-600 font-semibold px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-200">
                                Pending Approval
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRequestXp(task)}
                              className="px-6 py-3 bg-gradient-to-r from-[#002B28] to-[#004540] text-white rounded-xl font-semibold hover:from-[#004540] hover:to-[#006B5C] hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Request XP
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tasks