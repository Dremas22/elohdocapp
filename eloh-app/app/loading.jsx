"use client";

import {
  FaStethoscope,
  FaAmbulance,
  FaUserNurse,
  FaUserInjured,
  FaUser,
} from "react-icons/fa";

export default function GlobalLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-blue-50">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated rotating icons */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Outer spinning circle */}
          <div className="absolute rounded-full border-4 border-blue-600 border-t-transparent animate-spin h-24 w-24"></div>

          {/* Role icons */}
          <div className="absolute flex space-x-4">
            <FaStethoscope className="text-3xl text-blue-700 animate-bounce" />
            <FaAmbulance className="text-3xl text-blue-600 animate-bounce delay-150" />
            <FaUserNurse className="text-3xl text-blue-500 animate-bounce delay-300" />
            <FaUserInjured className="text-3xl text-blue-400 animate-bounce delay-450" />
            <FaUser className="text-3xl text-blue-300 animate-bounce delay-600" />
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-blue-700 text-xl font-semibold animate-pulse">
            Connecting you with patients and staff...
          </p>
          <p className="text-blue-500 text-sm mt-1">
            Preparing your dashboard and consultations
          </p>
        </div>
      </div>
    </div>
  );
}
