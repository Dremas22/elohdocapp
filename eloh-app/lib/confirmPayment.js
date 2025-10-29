import { toastError, toastSuccess } from "@/helpers/toastHelper";

/**
 * Confirms a payment for an ambulance trip and optionally returns the assigned driver.
 *
 * @async
 * @function confirmPayment
 * @param {string} sessionId - The payment session ID to confirm.
 * @param {Object} tripData - The trip details object containing trip info.
 * @param {string} userId - The ID of the user making the payment.
 * @param {string[]} [excludedDrivers=[]] - Optional array of driver IDs to exclude from assignment.
 * @returns {Promise<Object|undefined>} Returns the assigned driver object if successful; otherwise, undefined.
 *
 * @example
 * const driver = await confirmPayment("sess_123", trip, "user_456", ["driver_1"]);
 * if (driver) console.log("Assigned driver:", driver);
 */
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
