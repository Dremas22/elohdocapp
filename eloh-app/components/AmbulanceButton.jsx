"use client";

import Link from "next/link";
import { FaAmbulance } from "react-icons/fa";

const AmbulanceButton = () => {
  return (
    <div className="fixed lg:bottom-2 bottom-13 right-4 z-50">
      <Link href="/ambulance">
        <button
          aria-label="Request Ambulance"
          className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg scale-100 lg:scale-115 cursor-pointer animate-pulse focus:outline-none focus:ring-2 focus:ring-red-400"
          title="Request Ambulance"
        >
          <FaAmbulance className="lg:text-2xl text-xl" />
        </button>
      </Link>
    </div>
  );
};

export default AmbulanceButton;
