"use client";

import React, { useState } from "react";

const SignInOrSignUpForm = () => {
  const [activeForm, setActiveForm] = useState("signin");

  return (
    <div className="flex items-center justify-center w-full px-4">
      <div className="w-full max-w-md backdrop-blur-md bg-white/70 border border-gray-200 rounded-2xl shadow-xl p-8">
        {/* Toggle Tabs */}
        <div className="flex mb-6 rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveForm("signin")}
            className={`w-1/2 py-2 cursor-pointer text-sm font-semibold transition ${activeForm === "signin"
              ? "bg-[#03045e] text-white hover:bg-blue-800"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveForm("signup")}
            className={`w-1/2 py-2 text-sm font-semibold transition ${activeForm === "signup"
              ? "bg-green-600 text-white"
              : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Container */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center text-[#03045e] mb-4">
            {activeForm === "signin"
              ? "Welcome Back 👋"
              : "Create an Account ✨"}
          </h2>

          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {activeForm === "signup" && (
              <input
                type="password"
                placeholder="Confirm Password"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            )}

            <button
              type="submit"
              className={`w-full py-2 shadow-[0_9px_#999] active:shadow-[0_5px_#666] text-white rounded-lg font-semibold transition ${activeForm === "signin"
                ? "bg-[#03045e] hover:bg-blue-600"
                : "bg-green-600 hover:bg-green-700"
                }`}
            >
              {activeForm === "signin" ? "Sign In" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInOrSignUpForm;
