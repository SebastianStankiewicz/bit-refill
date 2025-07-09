"use client";
import React, { useState } from "react";

function RoleSelection({
  userId,
  onSelectRole,
  handleSignInToPreviousAccount,
  setUserId
}) {
  const [showSignInWindow, setShowSignInWindow] = useState(false);
  const [userIdToLogin, setUserIdToLogin] = useState("fdc57b21-8b32-4364-8dba-ea545be8fe42");
  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-gray-50 font-sans">
      {!showSignInWindow ? (
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md text-center space-y-8">
          <h1 className="text-3xl font-bold text-gray-800">TaskBank</h1>

          <button
            onClick={() => setShowSignInWindow(true)}
            className="px-8 py-4 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 transition-colors text-xl font-semibold"
          >
            Sign in
          </button>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-lg font-medium">
              or
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <p className="text-lg text-gray-600">Get started by choosing your role.</p>

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
            Your User ID:{" "}
            <span className="font-mono text-gray-700 break-all">{userId}</span>
          </p>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md text-center space-y-8">
          <h1 className="text-3xl font-bold text-gray-800">Sign in with Farcaster</h1>

          <input
            type="text"
            placeholder="Family Code"
            value={userIdToLogin}
            onChange={(e) => setUserIdToLogin(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center"
          />

          <button
            onClick={() => handleSignInToPreviousAccount(userIdToLogin)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors text-xl font-semibold"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default RoleSelection;
