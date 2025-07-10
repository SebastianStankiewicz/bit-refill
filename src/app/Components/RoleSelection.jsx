"use client";
import React, { useState } from "react";
import Image from "next/image";

function RoleSelection({
  userId,
  onSelectRole,
  handleSignInToPreviousAccount,
  setUserId
}) {
  const [showSignInWindow, setShowSignInWindow] = useState(false);
  const [userIdToLogin, setUserIdToLogin] = useState("fdc57b21-8b32-4364-8dba-ea545be8fe42");
  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 font-sans">
      {!showSignInWindow ? (
        <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg text-center space-y-6 sm:space-y-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-[#002B28] to-[#004540] rounded-2xl shadow-lg">
              <Image
                src="/bitrefill-logo.svg"
                alt="Bitrefill Logo"
                width={200}
                height={60}
                className="h-8 sm:h-10 md:h-12 w-auto filter brightness-0 invert"
              />
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#002B28] to-[#004540] bg-clip-text text-transparent">FamFill</h1>
            <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed px-2">
              Family XP management made simple.
            </p>
            <div className="flex justify-center">
              <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-[#002B28] to-[#004540] rounded-full"></div>
            </div>
          </div>

          <button
            onClick={() => setShowSignInWindow(true)}
            className="group relative w-full px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-[#002B28] to-[#004540] text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg sm:text-xl font-semibold overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#004540] to-[#002B28] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center justify-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign in
            </span>
          </button>

          <div className="relative flex py-4 sm:py-6 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 sm:mx-6 px-3 sm:px-4 py-2 bg-gray-50 text-gray-500 text-base sm:text-lg font-medium rounded-full border">
              or
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg sm:text-xl text-gray-700 font-medium px-2">Get started by choosing your role</p>
            <p className="text-sm text-gray-500 px-2">Select the option that best describes you</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <button
             onClick={() => onSelectRole('child')}
              className="group relative px-6 sm:px-8 py-5 sm:py-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 text-blue-800 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-base sm:text-lg font-semibold overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex flex-col items-center gap-2">
                <span className="text-2xl sm:text-3xl">👶</span>
                <span>I'm a Child</span>
              </span>
            </button>
            <button
             onClick={() => onSelectRole('parent')}
              className="group relative px-6 sm:px-8 py-5 sm:py-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 text-green-800 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-base sm:text-lg font-semibold overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex flex-col items-center gap-2">
                <span className="text-2xl sm:text-3xl">👨‍👩‍👧‍👦</span>
                <span>I'm a Parent</span>
              </span>
            </button>
          </div>

          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500 mb-2 font-medium">Your User ID</p>
            <p className="font-mono text-xs text-gray-700 break-all bg-white p-2 rounded border">{userId}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg text-center space-y-6 sm:space-y-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-r from-[#002B28] to-[#004540] rounded-full">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#002B28] to-[#004540] bg-clip-text text-transparent">Welcome Back</h1>
            <p className="text-gray-600 px-2">Enter your Auth code to continue</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-left">Auth Code</label>
            <input
              type="text"
              placeholder="Enter your Auth code"
              value={userIdToLogin}
              onChange={(e) => setUserIdToLogin(e.target.value)}
              className="block w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#002B28] focus:border-[#002B28] text-base sm:text-lg text-center transition-all duration-300 hover:border-gray-300"
            />
          </div>

          <button
            onClick={() => handleSignInToPreviousAccount(userIdToLogin)}
            className="group relative w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-[#002B28] to-[#004540] text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg sm:text-xl font-semibold overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#004540] to-[#002B28] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center justify-center gap-2">
              Continue
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          <button
            onClick={() => setShowSignInWindow(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm sm:text-base"
          >
            ← Back to role selection
          </button>
        </div>
      )}
    </div>
  );
}

export default RoleSelection;
