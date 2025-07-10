"use client";

import React from "react";
import { useRouter } from "next/navigation";

/**
 * ChooseDesignation Component
 *
 * Displays a section with:
 * - A heading: "Select Your Designation"
 * - Three role selection buttons (Doctor, Nurse, Patient)
 * - Glowing background blobs for visual design
 * - Responsive layout for mobile and desktop
 */

const ChooseDesignation = () => {
  const router = useRouter();

  // Define user roles with titles and routes
  const designations = [
    { id: 1, title: "DOCTOR", role: "doctor" },
    { id: 2, title: "NURSE", role: "nurse" },
    { id: 3, title: "PATIENT", role: "patient" },
    { id: 4, title: "AMBULANCE DRIVER", role: "driver" },
  ];

  // Navigate to the sign-in page with the selected role
  const handleSelect = (role) => {
    router.push(`/sign-in?role=${role}`);
  };

  return (
    // Main container for the section
    <div className="-mt-46 sm:-mt-35 mb-4 w-full bg-white py-25 sm:py-10 px-4 z-10 relative flex flex-col items-center overflow-hidden">

      {/* Animated glowing background blobs */}
      <div className="absolute w-52 h-52 sm:w-72 sm:h-72 bg-blue-500 rounded-full blur-[70px] sm:blur-[100px] top-0 left-6 opacity-20 animate-pulse z-0" />
      <div className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-blue-600 rounded-full blur-[80px] sm:blur-[110px] top-12 right-0 opacity-15 animate-pulse z-0" />
      <div className="absolute w-60 h-60 sm:w-80 sm:h-80 bg-blue-300 rounded-full blur-[80px] sm:blur-[110px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 animate-pulse z-0" />

      {/* Section heading */}
      <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#03045e] text-center mb-4 sm:mb-6 z-10">
        Sign Up / Sign In as...
      </h2>

      {/* Responsive button group */}
      <div className="grid gap-3 sm:gap-4 w-[25vh] max-w-xs sm:max-w-md z-10">
        {designations.map((designation) => (
          <button
            key={designation.id}
            onClick={() => handleSelect(designation.role)}
            className="bg-[#03045e] text-white py-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          >
            {designation.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChooseDesignation;
