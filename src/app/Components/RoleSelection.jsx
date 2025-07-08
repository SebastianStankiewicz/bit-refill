import React from 'react';

function RoleSelection({ userId, onSelectRole }) { // Removed supabase, userId is enough for display
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 font-sans">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md text-center space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome!</h1>
        <p className="text-lg text-gray-600">Get started by choosing your role.</p>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-lg font-medium">
            I am a
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center space-x-6">
          <button
            onClick={() => onSelectRole('child')}
            className="px-8 py-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors text-xl font-semibold"
          >
            A Child
          </button>
          <button
            onClick={() => onSelectRole('parent')}
            className="px-8 py-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors text-xl font-semibold"
          >
            A Parent
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Your User ID: <span className="font-mono text-gray-700 break-all">{userId}</span>
        </p>
      </div>
    </div>
  );
}

export default RoleSelection;