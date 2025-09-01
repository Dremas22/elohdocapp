"use client";

const ActiveRequest = ({ activeRequest, handleCancelRoute }) => {
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

        {/* Cancel button */}
        <div className="flex flex-col sm:flex-row justify-end mt-3 sm:mt-6 gap-2 sm:gap-3">
          <button
            onClick={handleCancelRoute}
            className="w-full sm:w-auto bg-red-600 text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl shadow hover:bg-red-700 transition cursor-pointer text-sm sm:text-base"
          >
            Cancel Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveRequest;
