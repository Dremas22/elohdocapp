import { toast } from "react-toastify";

const baseOptions = {
  position: "top-right",
  hideProgressBar: false,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

/**
 * Show a green success toast notification.
 *
 * @param {string} msg - The success message to display.
 * @param {number} [duration=3000] - Duration (ms) before toast auto-closes.
 * @returns {import("react-toastify").Id} The toast ID.
 */
export const toastSuccess = (msg, duration = 3000) =>
  toast.success(msg, {
    ...baseOptions,
    autoClose: duration,
    className: "bg-green-500 text-white font-semibold shadow-lg rounded-md",
  });

/**
 * Show a red error toast notification.
 *
 * @param {string} msg - The error message to display.
 * @param {number} [duration=3000] - Duration (ms) before toast auto-closes.
 * @returns {import("react-toastify").Id} The toast ID.
 */
export const toastError = (msg, duration = 3000) =>
  toast.error(msg, {
    ...baseOptions,
    autoClose: duration,
    className: "bg-red-500 text-white font-semibold shadow-lg rounded-md",
  });

/**
 * Show a blue info toast notification.
 *
 * @param {string} msg - The informational message to display.
 * @param {number} [duration=3000] - Duration (ms) before toast auto-closes.
 * @returns {import("react-toastify").Id} The toast ID.
 */
export const toastInfo = (msg, duration = 3000) =>
  toast.info(msg, {
    ...baseOptions,
    autoClose: duration,
    className: "bg-blue-500 text-white font-semibold shadow-lg rounded-md",
  });
