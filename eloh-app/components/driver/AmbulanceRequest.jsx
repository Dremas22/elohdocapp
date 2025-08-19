const AmbulanceRequest = ({
  ambulanceRequest,
  handleDecline,
  handleAcceptRequest,
}) => {
  return (
    <div className="fixed bottom-10 right-10 w-[400px] z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-red-600 p-6 relative overflow-hidden">
        {/* Header */}
        <h3 className="text-xl font-bold mb-3 flex items-center text-black">
          New Ambulance Request
        </h3>
        {/* Info */}
        <div className="space-y-2 text-gray-700">
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
        <div className="flex justify-between mt-6 space-x-4">
          <button
            onClick={() => handleAcceptRequest(ambulanceRequest)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-xl shadow hover:bg-green-700 hover:shadow-lg transition"
          >
            ✅ Accept
          </button>
          <button
            onClick={() => handleDecline()}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-xl shadow hover:bg-red-700 hover:shadow-lg transition"
          >
            ❌ Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceRequest;
