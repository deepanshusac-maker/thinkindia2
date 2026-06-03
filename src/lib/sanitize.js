/**
 * Sanitizes input strings to prevent XSS (Cross-Site Scripting) attacks.
 * Strips HTML tags and escapes dangerous characters.
 *
 * @param {string} input - The raw input string to sanitize.
 * @returns {string} The sanitized string.
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;

  return input
    .replace(/<[^>]*>/g, "") // Strip HTML tags completely
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Sanitizes objects recursively (useful for nested metadata objects).
 *
 * @param {Object} obj - The object to sanitize.
 * @returns {Object} The sanitized object.
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }

  const sanitized = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (typeof val === "object") {
        sanitized[key] = sanitizeObject(val);
      } else {
        sanitized[key] = sanitizeInput(val);
      }
    }
  }
  return sanitized;
}
