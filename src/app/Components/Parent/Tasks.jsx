import React, { useState, useEffect } from "react";

function Tasks({ supabase, familyId, childrenNames, tasks, setTasks, handleDeleteTask }) {
  const [newTaskDescription, setNewTaskDescription] = useState(""); // Changed from name to description
  const [newTaskXp, setNewTaskXp] = useState(10);
  const [selectedChildUid, setChildUid] = useState("");
  const [message, setMessage] = useState(null);

 

  const handleAddTask = async () => {
    if (!newTaskDescription.trim() || newTaskXp <= 0) {
      setMessage({
        text: "Please enter a valid task description and XP value.",
        type: "error",
      });
      return;
    }
    try {
      const { error } = await supabase.from("tasks").insert({
        family_id: familyId,
        description: newTaskDescription.trim(),
        xp_value: Number(newTaskXp),
        assigned_child_uid: selectedChildUid,
      });

      if (error) throw error;

      setTasks((prev) => [
        ...prev,
        {
          id: Date.now(), // Temp ID
          family_id: familyId,
          description: newTaskDescription.trim(),
          xp_value: Number(newTaskXp),
        },
      ]);

      setNewTaskDescription("");
      setNewTaskXp(10);
      setMessage({
        text: "Task added successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error adding task:", error.message);
      setMessage({
        text: "Failed to add task. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#002B28] to-[#004540] bg-clip-text text-transparent mb-2">
          Task Management
        </h1>
        <p className="text-gray-600 text-lg">
          Create and manage tasks for your family
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Add New Task Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-[#002B28] to-[#004540] rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Create New Task
            </h2>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Task Description
              </label>
              <input
                type="text"
                placeholder="e.g., Clean your room, Do homework, Take out trash"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002B28] focus:border-[#002B28] transition-all duration-200 bg-white/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assign to Child
              </label>
              <select
                value={selectedChildUid}
                onChange={(e) => setChildUid(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002B28] focus:border-[#002B28] transition-all duration-200 bg-white/50"
              >
                <option value="">Select a child</option>
                {childrenNames.map((child) => (
                  <option key={child.id} value={child.auth_uid}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                XP Reward
              </label>
              <input
                type="number"
                placeholder="XP Value"
                value={newTaskXp}
                onChange={(e) => setNewTaskXp(Number(e.target.value))}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002B28] focus:border-[#002B28] transition-all duration-200 bg-white/50"
              />
            </div>

            <button
              onClick={handleAddTask}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#002B28] to-[#004540] text-white rounded-xl hover:from-[#004540] hover:to-[#006B5C] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Task
            </button>
          </div>
        </div>

        {/* Assigned Tasks Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#002B28] to-[#004540] rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Active Tasks</h2>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full">
              <span className="text-[#002B28] font-semibold">
                {tasks.length} tasks
              </span>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No tasks created yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Create your first task above to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
  {tasks.map((task) => (
    <div
      key={task.id}
      className="p-6 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:border-[#002B28]/30 transition-all duration-300 hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center"> {/* Changed this line */}
        <div className="flex-1 mb-4 sm:mb-0"> {/* Added margin-bottom for stacking */}
          <h3 className="font-semibold text-gray-800 text-lg mb-1">
            {task.description}
          </h3>
          {task.assigned_child_uid && (
            <p className="text-sm text-gray-500">
              Assigned to:{" "}
              {childrenNames.find(
                (child) => child.auth_uid === task.assigned_child_uid
              )?.name || "Unknown"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
          <div className="bg-gradient-to-r from-[#002B28] to-[#004540] text-white px-4 py-2 rounded-full font-semibold">
            {task.xp_value} XP
          </div>
          <button
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:brightness-110 hover:scale-105 transition-all duration-200"
            onClick={() => handleDeleteTask(task.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tasks;
