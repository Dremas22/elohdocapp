const ActiveRequest = ({ activeRequest, handleCancelRoute }) => {
  return (
    <div className="fixed bottom-10 right-10 w-[400px] z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-green-600 p-6 relative overflow-hidden">
        <h3 className="text-xl font-bold mb-3 text-black">
          🚑 Active Ambulance Trip
        </h3>
        <div className="space-y-2 text-gray-700">
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
        <div className="flex justify-end mt-6">
          <button
            onClick={handleCancelRoute}
            className="bg-red-600 text-white w-full px-4 py-2 rounded-xl shadow hover:bg-red-700"
          >
            Cancel Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveRequest;
