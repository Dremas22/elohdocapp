/**
 * Utility function to normalize different timestamp formats into a JavaScript Date object.
 *
 * Supported input types:
 * - `undefined` or `null` → returns the current date/time.
 * - `number` → treated as a UNIX timestamp in milliseconds.
 * - `string` → parsed into a Date using the native Date constructor.
 * - Firestore `Timestamp` (objects with `.toDate()` method) → converted to a Date.
 * - Already a `Date` instance → returned as-is.
 *
 * Fallback:
 * - If input type is unrecognized, returns the current date/time.
 *
 * @param {number|string|Date|{toDate: Function}|null|undefined} createdAt - The input value representing a date or timestamp.
 * @returns {Date} A normalized JavaScript Date object.
 */
export const getMessageDate = (createdAt) => {
  if (!createdAt) return new Date();
  if (typeof createdAt === "number") return new Date(createdAt);
  if (typeof createdAt === "string") return new Date(createdAt);
  if ("toDate" in createdAt) return createdAt.toDate();
  if (createdAt instanceof Date) return createdAt;
  return new Date();
};
