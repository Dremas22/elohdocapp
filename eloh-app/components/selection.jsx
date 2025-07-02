"use client";

import React from "react";
import { useRouter } from "next/navigation";

const ChooseDesignation = () => {
  const router = useRouter();

  const designations = [
    { id: 1, title: "I AM DOCTOR", role: "doctor" },
    { id: 2, title: "I AM NURSE", role: "nurse" },
    { id: 3, title: "I AM PATIENT", role: "patient" },
  ];

  const handleSelect = (role) => {
    router.push(`/sign-in?role=${role}`);
  };

  return (
    <div
      // Fullscreen absolute overlay positioned over video 
      // Used 'inset-0' to stretche the div to cover entire viewport
      // Used 'flex flex-col items-center justify-start' to align the buttons vertically and horizontally
      // justification starts from the top 
      // Used 'pt-130' adds large padding-top to move buttons lower on the page
      // Used 'px-4' adds horizontal padding for mobile responsiveness
      className="absolute inset-0 flex flex-col items-center justify-start pt-130 px-4"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-[#03045e] mb-6 text-center">
        Select Your Designation
      </h2>

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
