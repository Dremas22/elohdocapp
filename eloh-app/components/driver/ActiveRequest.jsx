"use client";

const ActiveRequest = () => {
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
      </div>
    </div>
  );
};

export default ActiveRequest;
