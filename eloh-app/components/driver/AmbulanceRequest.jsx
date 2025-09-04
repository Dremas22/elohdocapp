"use client";

const AmbulanceRequest = ({
  ambulanceRequest,
  handleDecline,
  handleAcceptRequest,
}) => {
  return (
    <div
      className="fixed bottom-3 right-3 z-50 animate-slide-up
                 w-[95%] max-w-sm mx-auto sm:bottom-10 sm:right-10"
    >
      <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-gray-300 p-3 sm:p-6 relative overflow-hidden">
        {/* Header */}
        <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3 flex items-center text-black">
          New Ambulance Request
        </h3>

        {/* Info */}
        <div className="space-y-1 sm:space-y-2 text-gray-700 text-xs sm:text-base">
          <p>
            <strong>Customer:</strong> {ambulanceRequest.customerName}
          </p>
          <p>
            <strong>Pickup:</strong> {ambulanceRequest.pickupAddress}
          </p>
          <p>
            <strong>Fare:</strong>{" "}
            <span className="text-green-600 font-semibold">
              R{ambulanceRequest.fare}
            </span>
          </p>
          <p>
            <strong>Distance:</strong> {ambulanceRequest.distance} km
          </p>
          <p>
            <strong>Duration:</strong> {ambulanceRequest.duration} min
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between mt-3 sm:mt-6 gap-2 sm:gap-3">
          <button
            onClick={() => handleAcceptRequest(ambulanceRequest)}
            className="w-full sm:flex-1 bg-green-600 text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl shadow hover:bg-green-700 hover:shadow-lg transition cursor-pointer text-sm sm:text-base"
          >
            ✅ Accept
          </button>
          <button
            onClick={() => handleDecline()}
            className="w-full sm:flex-1 bg-red-600 text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl shadow hover:bg-red-700 hover:shadow-lg transition cursor-pointer text-sm sm:text-base"
          >
            ❌ Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceRequest;
