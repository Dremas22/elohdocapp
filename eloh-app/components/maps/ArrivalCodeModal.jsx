const ArrivalCodeModal = ({ fareDetails }) => {
  if (!fareDetails?.arrivalCode || !fareDetails?.status === "driver_arrived")
    return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-green-800 mb-3 text-center">
          🚑 Arrival Code
        </h3>
        <p className="text-4xl font-extrabold text-green-700 text-center tracking-widest">
          {fareDetails.arrivalCode}
        </p>
        <p className="text-sm text-gray-600 text-center mt-3">
          Please provide this code to the driver once they arrive and you have
          reached your destination.
        </p>
      </div>
    </div>
  );
};

export default ArrivalCodeModal;
