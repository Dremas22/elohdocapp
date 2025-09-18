/**
 * Calculate the time difference between now and a given appointment date/time.
 *
 * - If the appointment is in the future, returns a countdown like:
 *   "In 2d 3h 15m", "In 1h 5m", or "In 30m".
 *
 * - If the appointment has passed, returns how long ago it started like:
 *   "2d 3h 15m ago", "1h 5m ago", or "30m ago".
 *
 * @param {string} dateStr - The appointment date string (e.g. "Mon Feb 10 2025").
 * @param {string} timeStr - The appointment time string (e.g. "14:30" or "2:30 PM").
 * @returns {string} A human-readable string representing the time until/since the appointment.
 *
 * @example
 * getTimeUntil("Mon Feb 10 2025", "14:30"); // "In 2d 3h 15m"
 * getTimeUntil("Sun Feb 09 2025", "09:00"); // "3h 20m ago"
 */
export const getTimeUntil = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return "";

  const targetDate = new Date(`${dateStr} ${timeStr}`);
  if (isNaN(targetDate.getTime())) return "";

  const now = new Date();
  const diffMs = targetDate - now;

  const diffMins = Math.floor(Math.abs(diffMs) / (1000 * 60));
  const days = Math.floor(diffMins / (60 * 24));
  const hours = Math.floor((diffMins % (60 * 24)) / 60);
  const minutes = diffMins % 60;

  if (diffMs > 0) {
    // Future → time until appointment
    if (days > 0) return `In ${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `In ${hours}h ${minutes}m`;
    return `In ${minutes}m`;
  } else {
    // Past → how long ago appointment started
    if (days > 0) return `${days}d ${hours}h ${minutes}m ago`;
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  }
};

/**
 * Returns the number of days in a given month of a specific year.
 *
 * @function getDaysInMonth
 * @param {number} year - The full year (e.g., 2025).
 * @param {number} month - The month index (0 = January, 11 = December).
 * @returns {number} The number of days in the given month.
 *
 * @example
 * getDaysInMonth(2025, 1); // 28 (February 2025 has 28 days)
 * getDaysInMonth(2024, 1); // 29 (February 2024 is a leap year)
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
