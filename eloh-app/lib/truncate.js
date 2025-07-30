/**
 * Truncates a given text to a specified maximum length and appends ellipsis ("...") if it exceeds that length.
 *
 * @param {string} text - The text string to be truncated.
 * @param {number} [maxLength=50] - The maximum allowed length of the text before truncation.
 * @returns {string} The truncated text with "..." appended if it exceeded the limit, or the original text.
 * @throws {TypeError} If the input text is not a string.
 */
export const truncate = (text, maxLength = 50) => {
  if (typeof text !== "string") {
    throw new TypeError("Expected a string as the first argument.");
  }

  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};
