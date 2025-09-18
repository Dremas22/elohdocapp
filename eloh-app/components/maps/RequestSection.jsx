"use client";

import { FiMapPin } from "react-icons/fi";
import { FaLocationDot } from "react-icons/fa6";
import CalculatingTrip from "./CalculatingTrip";
import FareDetails from "./FareDetails";

export default function RequestSection(props) {
  const {
    pickupInputRef,
    destInputRef,
    fareDetails,
    calculatingTrip,
    routeReady,
    setShowPay,
    useMyLocation,
    handleCreateRoute,
    handleCancelRoute,
  } = props;
  return (
    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
        🚑 Request Ambulance
      </h2>

      {/* Pickup */}
      <label className="block text-lg sm:text-xl font-medium mb-2">
        Pickup location
      </label>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative w-full">
          <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            ref={pickupInputRef}
            type="text"
            placeholder="Enter pickup address"
            disabled={!!fareDetails?.isPaid}
            className={`flex-1 p-3 pl-10 border rounded-lg w-full ${
              fareDetails?.isPaid
                ? "bg-gray-200 cursor-not-allowed"
                : "border-gray-300"
            }`}
          />
        </div>
        <button
          onClick={useMyLocation}
          disabled={!!fareDetails?.isPaid}
          className={`bg-[#03045e] text-white font-semibold py-2 px-8 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out flex items-center gap-2 -mt-2 ${
            fareDetails?.isPaid ? "bg-gray-300 cursor-not-allowed" : ""
          }`}
        >
          <FaLocationDot className="inline-block mr-1" /> Use My Location
        </button>
      </div>

      {/* Destination */}
      <label className="block text-lg sm:text-xl font-medium mb-2">
        Destination
      </label>
      <div className="relative mb-4">
        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          ref={destInputRef}
          type="text"
          placeholder="Enter hospital or clinic"
          disabled={!!fareDetails?.isPaid}
          className={`flex-1 p-3 pl-10 border rounded-lg w-full ${
            fareDetails?.isPaid
              ? "bg-gray-200 cursor-not-allowed"
              : "border-gray-300"
          }`}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Create Route */}
        <button
          onClick={handleCreateRoute}
          disabled={fareDetails?.isPaid}
          className={`flex-1 py-3 rounded-xl text-white ${
            fareDetails?.isPaid
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#03045e] hover:bg-[#023e8a]"
          }`}
        >
          Create Route
        </button>

        {/* Cancel Route */}
        {fareDetails &&
          (fareDetails.isPaid ? (
            <button
              disabled
              className="bg-gray-400 text-white py-3 px-8 rounded-xl cursor-not-allowed"
            >
              Trip Paid – Cannot Cancel
            </button>
          ) : (
            <button
              onClick={handleCancelRoute}
              className="bg-[#03045e] text-white py-3 px-8 rounded-xl"
            >
              Cancel Route
            </button>
          ))}
      </div>

      {calculatingTrip && <CalculatingTrip />}
      {fareDetails && <FareDetails fareDetails={fareDetails} />}

      {/* Request Ambulance */}
      <div className="mt-4">
        {fareDetails?.isPaid ? (
          <p className="text-green-700 font-semibold text-center">
            ✅ Your ambulance is on the way!
          </p>
        ) : (
          <button
            onClick={() => setShowPay(true)}
            disabled={!routeReady}
            className={`w-full py-3 rounded-xl text-white ${
              routeReady ? "bg-red-600 hover:bg-red-700" : "bg-gray-300"
            }`}
          >
            Request Ambulance
          </button>
        )}
      </div>
    </div>
  );
}
