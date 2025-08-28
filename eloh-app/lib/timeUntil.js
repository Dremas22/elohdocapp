// Helper: calculate time until appointment using vanilla JS
export const getTimeUntil = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return "";

  const targetDate = new Date(`${dateStr} ${timeStr}`);
  if (isNaN(targetDate.getTime())) return "";

  const now = new Date();
  const diffMs = targetDate - now;

  if (diffMs <= 0) return "Already started";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(diffMins / (60 * 24));
  const hours = Math.floor((diffMins % (60 * 24)) / 60);
  const minutes = diffMins % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
