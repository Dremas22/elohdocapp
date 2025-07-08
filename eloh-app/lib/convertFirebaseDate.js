// ✅ Convert Firestore Timestamps to plain JS values
export const convertTimestamp = (timestamp) => {
  if (!timestamp) return null;
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  // If it's a string or unknown format, try new Date conversion
  try {
    return new Date(timestamp).toISOString();
  } catch {
    return null;
  }
};

/**
 *  const doctorDataRaw = doctorSnap.data();
 *     const doctorData = {
      ...doctorDataRaw,
      createdAt: convertTimestamp(doctorDataRaw.createdAt),
      updatedAt: convertTimestamp(doctorDataRaw.updatedAt),
    };
 */
