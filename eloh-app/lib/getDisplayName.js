/**
 * Returns a display-friendly name for the user.
 *
 * - If role is `"doctor"`, prefixes with `"Dr"`.
 * - If role is `"nurse"`, prefixes with `"Nurse"`.
 * - Otherwise, uses the full name directly.
 *
 * @param {Object} currentUser - The user object.
 * @param {string} currentUser.fullName - The user's full name.
 * @param {string} [currentUser.role] - Optional user role for title prefixing.
 * @returns {string} Formatted display name or "Unknown User".
 */
export const getDisplayName = (currentUser) => {
  if (!currentUser || !currentUser?.fullName) return "Unknown User";
  if (currentUser.role === "doctor") return `Dr ${currentUser.fullName}`;
  if (currentUser.role === "nurse") return `Nurse ${currentUser.fullName}`;
  return currentUser.fullName;
};
