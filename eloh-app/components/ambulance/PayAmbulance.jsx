"use client";

import { auth } from "@/db/client";
import { findNearestAvailableDriver, notifyDriver } from "@/helpers";
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
        type: "ambulance_request", // or other status tracking
      };

      // Send notification to driver (write to Firestore)
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
    <div className="w-[70%] bg-white rounded-xl shadow-md p-6 mt-6">
      <button
        onClick={handleProceed}
        disabled={loading}
        className={`mt-4 text-white py-2 px-4 rounded cursor-pointer ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading
          ? "Processing..."
          : "Proceed to pay and search for available ambulances"}
      </button>
    </div>
  );
}
