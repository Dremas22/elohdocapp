import { toastError, toastSuccess } from "@/helpers/toastHelper";

const confirmPayment = async (sessionId, tripData, userId) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/confirm-ambulance-payment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, tripData, userId }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      toastError(`Payment confirm failed: ${err.error}`);
      return;
    }

    const driver = await res.json();

    toastSuccess("Payment successful! Ambulance dispatched 🚑");
  } catch (err) {
    console.error("Confirm payment error:", err);
    toastError("Something went wrong confirming your payment");
  }
};

export default confirmPayment;
