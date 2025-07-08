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
    <div className="-mt-36 mb-5 w-full bg-white py-10 px-4 z-10 relative flex flex-col items-center overflow-hidden">
      {/* Glowing blobs above the white background */}
      <div className="absolute w-72 h-72 bg-blue-500 rounded-full blur-[100px] top-0 left-10 opacity-25 animate-pulse z-0" />
      <div className="absolute w-96 h-96 bg-blue-600 rounded-full blur-[110px] top-16 right-0 opacity-20 animate-pulse z-0" />
      <div className="absolute w-80 h-80 bg-blue-300 rounded-full blur-[110px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 animate-pulse z-0" />
      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-bold text-[#03045e] text-center mb-6 z-10">
        Select Your Designation
      </h2>

      {/* Buttons */}
      <div className="grid gap-4 w-full max-w-md z-10">
        {designations.map((designation) => (
          <button
            key={designation.id}
            onClick={() => handleSelect(designation.role)}
            className="bg-[#03045e] text-white py-3 px-5 text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          >
            {designation.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChooseDesignation;
