"use client";

import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

const baseStyles = {
  container:
    "inline-flex items-center px-3 py-2 rounded-2xl shadow-md font-medium text-center mb-4",
  icon: "mr-2 text-xl",
  error: "bg-red-100 text-red-700 border border-red-300",
  success: "bg-green-100 text-green-700 border border-green-300",
};

/**
 * MessageBanner Component
 *
 * Displays a feedback message to the user. Supports both error and success messages.
 * - Error messages appear in red with a close icon.
 * - Success messages appear in green with a check icon.
 * - Width automatically adjusts based on the message length.
 *
 * @param {Object} props - Component props
 * @param {"error"|"success"} props.type - Type of message to display
 * @param {string} props.message - The message to display
 *
 * @returns {JSX.Element|null} The message banner element or null if no message
 */
const MessageBanner = ({ type, message }) => {
  if (!message) return null;

  const typeStyles =
    type === "error"
      ? baseStyles.error
      : type === "success"
      ? baseStyles.success
      : "";

  const Icon =
    type === "error"
      ? AiOutlineCloseCircle
      : type === "success"
      ? AiOutlineCheckCircle
      : null;

  return (
    <div className={`${baseStyles.container} ${typeStyles}`}>
      {Icon && <Icon className={baseStyles.icon} />}
      <span>{message}</span>
    </div>
  );
};

export default MessageBanner;
