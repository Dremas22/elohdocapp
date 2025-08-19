"use client";

import { auth } from "@/db/client";
import { findNearestAvailableDriver } from "@/helpers";
import { toastError, toastSuccess } from "@/helpers/toastHelper";
import { useState } from "react";

export default function PayAmbulance({
  fare,
  distance,
  duration,
  hospital,
  pickupLocation,
}) {
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    setLoading(true);

    try {
      // Find nearest available ambulance driver
      const nearestDriver = await findNearestAvailableDriver(pickupLocation);

      if (!nearestDriver) {
        alert("No available ambulances nearby at the moment.");
        setLoading(false);
        return;
      }

      // Prepare trip details
      const tripDetails = {
        fare,
        distance,
        pickupAddress: pickupLocation.address,
        duration,
        hospital,
        pickupLocation,
        type: "ambulance_request",
      };

      // Send notification to driver
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/send-ambulance-notification`,
        {
          method: "POST",
          body: JSON.stringify({
            driverId: nearestDriver?.userId || nearestDriver?.id,
            tripDetails,
            customerId: auth?.currentUser?.uid,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        toastError(`Error: ${response.text()}`);
      }

      toastSuccess(`Ambulance request sent to driver ${nearestDriver.id}.`);
    } catch (error) {
      console.error("Error sending ambulance request:", error);
      toastError("Failed to send ambulance request. Please try again.", 5000);
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center mt-6 w-full">
      <button
        onClick={handleProceed}
        disabled={loading}
        className={`flex justify-center items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 transform
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed shadow-none"
              : "bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_4px_#999] active:shadow-[0_2px_#666]"
          }`}
      >
        {/* spinner while loading */}
        {loading && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
        )}

        {loading ? "Processing..." : "Pay & Request Ambulance"}
      </button>
    </div>
  );
}
