import React, { useState, useEffect } from "react";

function Tasks({ supabase, familyId, childrenNames, tasks, setTasks }) {
  const [newTaskDescription, setNewTaskDescription] = useState(""); // Changed from name to description
  const [newTaskXp, setNewTaskXp] = useState(10);
  const [selectedChildUid, setChildUid] = useState("");

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
        assigned_child_uid: selectedChildUid
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
    } catch (error) {
      console.error("Error adding task:", error.message);
    }
  };

  return (
    <div>
      <div className="border p-6 rounded-lg space-y-4 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800">Add New Task</h2>
        <div></div>
        <input
          type="text"
          placeholder="Task Description (e.g., Do the dishes)"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <select
          value={selectedChildUid}
          onChange={(e) => setChildUid(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a child</option>
          {childrenNames.map((child) => (
            <option key={child.id} value={child.auth_uid} >
              {child.name}
            </option>
          ))}
        </select>
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

      <div className="border p-6 rounded-lg space-y-4 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800">
          Assigned Tasks ({tasks.length})
        </h2>
        {tasks.length === 0 ? (
          <p className="text-gray-600">No tasks created yet.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="p-3 bg-gray-50 rounded-md border flex justify-between items-center"
              >
                <p className="font-semibold">{task.description}</p>
                <span className="text-blue-600">{task.xp_value} XP</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Tasks;
