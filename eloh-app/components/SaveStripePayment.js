"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const SaveStripePayment = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      fetch(`${process.env.NEXT_PUBLIC_URL}/api/stripe-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            toast.success("✅ Payment saved to Firestore");
          } else {
            toast.error("⚠️ Could not save payment:", data.error);
          }
        });
    }
  }, [sessionId]);

  return null;
};

export default SaveStripePayment;
