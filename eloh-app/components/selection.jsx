"use client";

import React from "react";
import { useRouter } from "next/navigation";

// This component renders role selection buttons over the video
const ChooseDesignation = () => {
  const router = useRouter();

  // Array of designations (each with a role and display title)
  const designations = [
    { id: 1, title: "I AM DOCTOR", role: "doctor" },
    { id: 2, title: "I AM NURSE", role: "nurse" },
    { id: 3, title: "I AM PATIENT", role: "patient" },
  ];

  // Function to handle button click and navigate to sign-in page with role as a query param
  const handleSelect = (role) => {
    router.push(`/sign-in?role=${role}`);
  };

  return (
    <div
      // Fullscreen overlay centered with black transparency
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4"
    >
      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
        Select Your Designation
      </h2>

      {/* Render each designation as a button */}
      <div className="grid gap-4 w-full max-w-md">
        {designations.map((designation) => (
          <button
            key={designation.id}
            onClick={() => handleSelect(designation.role)}
            className="w-full py-3 px-6 bg-blue-600 text-white font-medium text-lg rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            {designation.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChooseDesignation;
