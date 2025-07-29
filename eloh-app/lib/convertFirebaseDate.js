/**
 * Converts various timestamp formats to a human-readable date string.
 *
 * Supports:
 * - Firestore Timestamp object (`timestamp.toDate()`)
 * - Firestore native object with `_seconds` field
 * - JavaScript `Date` object
 * - ISO date strings or other valid date strings
 *
 * Formats the date in `"en-ZA"` locale (e.g., "29 July 2025").
 *
 * @param {any} timestamp - The timestamp to convert. Can be Firestore Timestamp, JS Date, object with `_seconds`, or date string.
 * @returns {string} A formatted date string or a fallback message like "Unknown" or "Invalid date".
 */

export const convertTimestamp = (timestamp) => {
  if (!timestamp) return "Unknown";

  // Handle Firestore timestamp object with _seconds
  if (typeof timestamp._seconds === "number") {
    return new Date(timestamp._seconds * 1000).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Handle Firestore Timestamp object
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Handle JS Date object
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Handle string or fallback
  try {
    return new Date(timestamp).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};
