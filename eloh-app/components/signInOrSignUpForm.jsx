'use client';

import React, { useState } from 'react';

const SignInOrSignUpForm = () => {
  const [activeForm, setActiveForm] = useState('signin'); // ✅ Removed TypeScript syntax

  return (
    <div className=" flex pd-10 items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Toggle Buttons */}
        <div className="flex justify-between mb-6">
          <button
            onClick={() => setActiveForm('signin')}
            className={`w-1/2 py-2 rounded-l-lg text-white ${
              activeForm === 'signin' ? 'bg-blue-600' : 'bg-blue-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveForm('signup')}
            className={`w-1/2 py-2 rounded-r-lg text-white ${
              activeForm === 'signup' ? 'bg-green-600' : 'bg-green-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        {activeForm === 'signin' ? (
          <div>
            <h2 className="text-xl font-bold text-center mb-4 text-gray-700">Welcome Back 👋</h2>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-center mb-4 text-gray-700">Create an Account ✨</h2>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                required
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                Sign Up
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignInOrSignUpForm;
