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
              ? "bg-gray-300 hover:bg-gray-200 cursor-not-allowed shadow-[0_4px_#999]"
              : "bg-[#03045e] shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
          }`}
        >
          Create Route
        </button>

        {/* Cancel Route */}
        {fareDetails &&
          (fareDetails.isPaid ? (
            <button
              disabled
              className="flex-1 bg-gray-400 text-white py-3  rounded-xl cursor-not-allowed shadow-[0_4px_#999]"
            >
              Trip Paid – Cannot Cancel
            </button>
          ) : (
            <button
              onClick={handleCancelRoute}
              className="flex-1 bg-[#03045e] text-white py-3 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer"
            >
              Cancel Route
            </button>
          ))}
      </div>

      {calculatingTrip && <CalculatingTrip />}
      {fareDetails && fareDetails.status === "pending" && (
        <FareDetails fareDetails={fareDetails} />
      )}

      {fareDetails && fareDetails.status === "completed" && (
        <div className="p-4 my-4 text-center rounded-xl shadow-md bg-green-50 border border-green-200">
          <p className="text-green-700 font-semibold text-lg flex items-center justify-center gap-2">
            ✅ Trip completed
          </p>
          <p className="text-green-600 text-sm mt-1">
            Please create a new one to continue.
          </p>
        </div>
      )}

      {/* Request Ambulance */}
      <div className="mt-4">
        {fareDetails?.isPaid && fareDetails?.status === "accepted" ? (
          <p className="text-green-700 font-semibold text-center bg-green-100 border border-green-300 rounded-xl px-4 py-3 shadow-sm">
            🚑 A driver has accepted your request and is on the way. Please stay
            ready — you’ll be notified once they arrive!
          </p>
        ) : fareDetails?.isPaid && fareDetails.status === "paid" ? (
          <p className="text-green-700 font-semibold text-center">
            Request received, we’re currently assigning the best available
            driver for you.
          </p>
        ) : (
          <button
            onClick={() => setShowPay(true)}
            disabled={
              !routeReady ||
              fareDetails?.status === "completed" ||
              fareDetails?.isPaid
            }
            className="w-full py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200"
          >
            Request Ambulance
          </button>
        )}
      </div>
    </div>
  );
}
