import { toastError, toastSuccess } from "@/helpers/toastHelper";

const confirmPayment = async (
  sessionId,
  tripData,
  userId,
  excludedDrivers = []
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/confirm-ambulance-payment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, tripData, userId, excludedDrivers }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toastError(`Payment confirm failed: ${data.error || "Unknown error"}`);
      return;
    }

    const { driver, message } = data;

    toastSuccess(`${message}` || "Payment successful! Ambulance dispatched 🚑");

    return driver;
  } catch (err) {
    console.error("Confirm payment error:", err);
    toastError("Something went wrong confirming your payment");
  }
};

export default confirmPayment;
