"use client";

import { toastError, toastSuccess } from "@/helpers/toastHelper";
import useCurrentUser from "@/hooks/useCurrentUser";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getAddressFromLatLng } from "@/helpers";
import { useUserStore } from "@/hooks/useUserStore";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function PayAmbulance({
  fare,
  distance,
  duration,
  hospital,
  pickupLocation,
  userDoc,
}) {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useCurrentUser();
  const { currentUser: user } = useUserStore();

  // 🔹 Start Stripe checkout
  const handleProceed = async () => {
    setLoading(true);

    const pickUpddress = getAddressFromLatLng(
      pickupLocation?.lat,
      pickupLocation?.lng
    );

    const dropOffAddress = getAddressFromLatLng(hospital?.lat, hospital?.lng);

    console.log(pickUpddress, "PICK_UP_ADDRESS");
    console.log(dropOffAddress, "DROP_OFF_ADDRESS");
    try {
      const destination = { lat: hospital.lat, lng: hospital.lng };
      const tripDetails = {
        fare,
        distance,
        duration,
        hospital,
        pickupLocation: {
          ...pickupLocation,
          adress: pickUpddress,
        },
        destination: {
          ...destination,
          address: dropOffAddress,
        },
        type: "ambulance_request",
        customerName: userDoc?.fullName || user?.fullName,
        customerEmail: currentUser?.email || userDoc?.email,
        customerId: userDoc?.userId,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/stripe-checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...tripDetails,
            customerEmail: currentUser?.email || userDoc?.email,
            userId: currentUser?.uid,
            role: "customer",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toastError(data.error || "Failed to start payment");
        setLoading(false);
        return;
      }

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      console.error("Error starting payment:", err);
      toastError("Failed to process payment");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <button
        onClick={handleProceed}
        disabled={loading}
        className={`flex justify-center items-center gap-2 px-6 py-2 rounded-2xl font-semibold text-white transition-all duration-300 transform ${
          loading
            ? "bg-gray-400 cursor-not-allowed shadow-none"
            : "bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_4px_#999] active:shadow-[0_2px_#666]"
        }`}
      >
        {loading ? (
          <>
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
            Processing...
          </>
        ) : (
          "Pay & Request Ambulance"
        )}
      </button>
    </div>
  );
}
