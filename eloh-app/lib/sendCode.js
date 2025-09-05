import emailjs from "@emailjs/browser";
import { toastInfo, toastError } from "@/helpers/toastHelper";

/**
 * Sends a unique 6-digit ambulance arrival verification code
 * to the customer's email using EmailJS.
 *
 * The generated code can later be stored in Firestore and used
 * for trip verification when the driver arrives.
 *
 * @async
 * @function sendArrivalCodeEmail
 * @param {Object} activeRequest - The active ambulance trip request details.
 * @param {string} activeRequest.customerName - Name of the customer.
 * @param {string} activeRequest.pickupAddress - Pickup address for the trip.
 * @param {string} [activeRequest.destinationAddress] - Destination address (optional).
 * @param {number|string} activeRequest.fare - Fare for the trip.
 * @param {string} customerEmail - The email address of the customer.
 * @returns {Promise<string|null>} Returns the generated 6-digit code if successful,
 * or `null` if the email failed to send.
 *
 * @example
 * const code = await sendArrivalCodeEmail(activeRequest, "customer@example.com");
 * if (code) {
 *   // Save the code in Firestore for later verification
 *   await setDoc(doc(db, "trips", userId), { verificationCode: code }, { merge: true });
 * }
 */
const sendArrivalCodeEmail = async (activeRequest, customerEmail) => {
  if (!activeRequest || !customerEmail) return;

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    const templateParams = {
      customer_name: activeRequest.customerName,
      code: code,
      pickup_address:
        activeRequest.pickupAddress || activeRequest.pickupLocation.address,
      destination_address:
        activeRequest.destinationAddress ||
        activeRequest.hospital.address ||
        "N/A",
      fare: activeRequest.fare,
      customer_email: customerEmail,
    };

    const result = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID_CODE,
      process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID_CODE,
      templateParams,
      process.env.NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY
    );

    toastInfo(`${result.text} : Arrival code sent to ${customerEmail} `);

    // TODO: Remove the above, I just added the line below for customers using fake emails(testing purposes)

    alert(`Code: ${code}`);

    return code; // return code so you can save it to Firestore
  } catch (err) {
    console.error("Failed to send email:", err);
    toastError("Failed to send code via email");
    return null;
  }
};

export default sendArrivalCodeEmail;
