"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaUserMd, FaUserNurse, FaUser, FaAmbulance } from "react-icons/fa";

/**
 * ChooseDesignation Component
 *
 * Displays a section with:
 * - A heading: "Sign Up / Sign In as a..."
 * - Four role selection buttons (Doctor, Nurse, Patient, Ambulance) with icons
 * - Tooltips for each button
 * - Glowing background blobs for visual design
 * - Responsive layout: single column on mobile, 2x2 grid on desktop
 */

const ChooseDesignation = () => {
  const router = useRouter();

  // Define user roles with titles, routes, icons, and tooltip descriptions
  const designations = [
    {
      id: 1,
      title: "DOCTOR",
      role: "doctor",
      icon: <FaUserMd className="mr-2" />,
      tooltip: "Access your doctor dashboard and start consulting patients",
    },
    {
      id: 2,
      title: "NURSE",
      role: "nurse",
      icon: <FaUserNurse className="mr-2" />,
      tooltip: "Access your nurse dashboard and manage patient care",
    },
    {
      id: 3,
      title: "PATIENT",
      role: "patient",
      icon: <FaUser className="mr-2" />,
      tooltip: "Access your patient dashboard and receive treatment",
    },
    {
      id: 4,
      title: "AMBULANCE",
      role: "ambulance",
      icon: <FaAmbulance className="mr-2" />,
      tooltip: "Access ambulance dashboard to request/respond to emergencies",
    },
  ];

  // Navigate to the sign-in page with the selected role
  const handleSelect = (role) => {
    if (role === "ambulance") {
      router.push("/ambulance");
    } else {
      router.push(`/sign-in?role=${role}`);
    }
  };

  return (
    <div className="-mt-75 sm:-mt-36 mb-5 w-full h-full bg-white py-25 sm:py-10 px-3 z-10 relative flex flex-col items-center overflow-hidden">
      {/* Animated glowing background blobs */}
      <div className="absolute w-52 h-52 sm:w-72 sm:h-72 bg-blue-500 rounded-full blur-[70px] sm:blur-[100px] top-0 left-6 opacity-20 animate-pulse z-0" />
      <div className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-blue-600 rounded-full blur-[80px] sm:blur-[110px] top-12 right-0 opacity-15 animate-pulse z-0" />
      <div className="absolute w-60 h-60 sm:w-80 sm:h-80 bg-blue-300 rounded-full blur-[80px] sm:blur-[110px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 animate-pulse z-0" />
      <div className="absolute w-52 h-52 sm:w-72 sm:h-72 bg-blue-500 rounded-full blur-[70px] sm:blur-[100px] bottom-0 right-6 opacity-20 animate-pulse z-0" />

      {/* Section heading */}
      <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#03045e] text-center mb-4 sm:mb-6 z-10">
        Sign Up / Sign In
      </h2>

      {/* Responsive button grid with tooltips and icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-md z-10">
        {designations.map((designation) => (
          <button
            key={designation.id}
            title={designation.tooltip}
            onClick={() => handleSelect(designation.role)}
            className="bg-[#03045e] text-white py-3 text-sm sm:text-lg font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center"
          >
            {designation.icon}
            {designation.title}
          </button>
        ))}
      </div>
      
    </div>
  );
};

export default ChooseDesignation;
