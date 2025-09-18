"use client";

import { FiCheck } from "react-icons/fi";

const ActiveRequest = ({ activeRequest, handleCancelRoute, onTripEnded }) => {
  return (
    <div
      className="fixed bottom-3 right-3 z-50 animate-slide-up
                 w-[95%] max-w-sm mx-auto sm:bottom-10 sm:right-10"
    >
      <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-green-600 p-3 sm:p-4 relative overflow-hidden">
        {/* Header */}
        <h3 className="text-base sm:text-lg text-center font-bold mb-2 sm:mb-3 text-black">
          🚑 Active Ambulance Trip
        </h3>

        {/* Arrived button */}
        <div className="flex justify-center mt-3 sm:mt-4">
          <button
            onClick={onTripEnded}
            className="bg-green-600 hover:bg-[#023e8a] text-white text-xs sm:text-sm font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-1 shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 transition-all duration-200 ease-in-out cursor-pointer"
          >
            <FiCheck className="h-5 w-5" />
            Arrived
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveRequest;
