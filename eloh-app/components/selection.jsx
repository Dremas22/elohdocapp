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
      className="absolute inset-0 flex flex-col items-center justify-start pt-140 px-4"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-[#03045e] mb-6 text-center">
        Select Your Designation
      </h2>

      <div className="grid py-3 gap-4 w-full max-w-md">
        {designations.map((designation) => (
          <button
            key={designation.id}
            onClick={() => handleSelect(designation.role)}
            className=" bg-[#03045e] text-white py-3 px-5 text-lg font-semibold rounded-xl shadow-[0_9px_#999] active:shadow-[0_5px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out"
          >
            {designation.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChooseDesignation;
