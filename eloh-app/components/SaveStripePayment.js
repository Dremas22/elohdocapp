"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const SaveStripePayment = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      const hasShownToast = sessionStorage.getItem(`shown-toast-${sessionId}`);
      if (hasShownToast) return; // Prevent duplicate toasts

      fetch(`${process.env.NEXT_PUBLIC_URL}/api/stripe-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            toast.success(
              "🎉 Payment successful! Your consultations has been updated.",
              {
                duration: 8000,
              }
            );

            sessionStorage.setItem(`shown-toast-${sessionId}`, "true");
          } else {
            toast.error("⚠️ Payment failed to save. Please try again.");
          }
        });
    }
  }, [sessionId]);

  return null;
};

export default SaveStripePayment;
