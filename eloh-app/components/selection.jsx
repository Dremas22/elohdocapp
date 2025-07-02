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
      // 'inset-0' stretches the div to cover entire viewport
      // 'flex flex-col items-center justify-start' aligns content
      // 'pt-130' pushes the content lower down the page
      // 'px-4' provides horizontal padding for responsiveness
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
            className="w-full py-3 px-6 bg-[#03045e] text-white font-medium text-lg rounded-xl shadow-lg hover:bg-[#021f3e] transition duration-300 transform hover:scale-105 cursor-pointer"
          >
            {designation.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChooseDesignation;
