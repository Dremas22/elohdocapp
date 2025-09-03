"use client";

import { FiCheck } from "react-icons/fi";

const ActiveRequest = ({ activeRequest, handleCancelRoute, onTripEnded }) => {
  return (
    <div
      className="fixed bottom-3 right-3 z-50 animate-slide-up
                 w-[95%] max-w-sm mx-auto sm:bottom-10 sm:right-10"
    >
      <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-green-600 p-3 sm:p-6 relative overflow-hidden">
        {/* Header */}
        <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3 text-black">
          🚑 Active Ambulance Trip
        </h3>

        {/* Info */}
        <div className="space-y-1 sm:space-y-2 text-gray-700 text-xs sm:text-sm">
          <p>
            <strong>Customer:</strong> {activeRequest.customerName}
          </p>
          <p>
            <strong>Pickup:</strong> {activeRequest.pickupAddress}
          </p>
          <p>
            <strong>Fare:</strong> R{activeRequest.fare}
          </p>
          <p>
            <strong>Distance:</strong> {activeRequest.distance} km
          </p>
          <p>
            <strong>Duration:</strong> {activeRequest.duration} min
          </p>
        </div>

        {/* Cancel & Arrived buttons */}
        <div className="flex flex-col sm:flex-row justify-end mt-3 sm:mt-6 gap-2 sm:gap-3">
          {/* Cancel Trip */}
          <button
            onClick={handleCancelRoute}
            className="flex-1 sm:flex-none w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl shadow transition-all duration-200 ease-in-out text-sm sm:text-base font-semibold"
          >
            Cancel Trip
          </button>

          {/* Arrived */}
          <button
            onClick={onTripEnded}
            className="flex-1 sm:flex-none w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl shadow transition-all duration-200 ease-in-out text-sm sm:text-base font-semibold flex items-center justify-center gap-2"
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
