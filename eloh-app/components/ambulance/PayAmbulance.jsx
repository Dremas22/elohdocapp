"use client";

import { auth } from "@/db/client";
import { toastError, toastSuccess } from "@/helpers/toastHelper";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function PayAmbulance({
  fare,
  distance,
  duration,
  hospital,
  pickupLocation,
}) {
  const [loading, setLoading] = useState(false);

  // 🔹 Call confirm API
  const confirmPayment = async (sessionId) => {
    try {
      const tripDetails = {
        fare,
        distance,
        duration,
        hospital,
        pickupLocation,
        type: "ambulance_request",
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/confirm-ambulance-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            tripData: tripDetails,
            userId: auth?.currentUser?.uid,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        toastError(`Payment confirm failed: ${err.error}`);
        return;
      }

      toastSuccess("Payment successful! Ambulance dispatched 🚑");
    } catch (err) {
      console.error("Confirm payment error:", err);
      toastError("Something went wrong confirming your payment");
    }
  };

  // 🔹 Confirm payment after redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    const type = urlParams.get("type");

    if (sessionId && type === "ambulance_request" && auth?.currentUser?.uid) {
      confirmPayment(sessionId);
      // cleanup URL
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // 🔹 Start Stripe checkout
  const handleProceed = async () => {
    setLoading(true);
    try {
      const tripDetails = {
        fare,
        distance,
        duration,
        hospital,
        pickupLocation,
        type: "ambulance_request",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/stripe-checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...tripDetails,
            customerEmail: auth?.currentUser?.email,
            userId: auth?.currentUser?.uid,
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
        className={`flex justify-center items-center gap-2 px-6 py-2 rounded-2xl font-semibold text-white transition-all duration-300 transform
          ${
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
