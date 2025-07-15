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
