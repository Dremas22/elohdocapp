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
              "✅ Payment saved to DB. Please refresh the page to see your updated consultations.",
              { duration: 8000 }
            );
            sessionStorage.setItem(`shown-toast-${sessionId}`, "true");
          } else {
            console.error("⚠️ Could not save payment");
          }
        });
    }
  }, [sessionId]);

  return null;
};

export default SaveStripePayment;
