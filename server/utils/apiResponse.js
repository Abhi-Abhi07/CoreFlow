// Standard API response helpers used across controllers and middleware.

/**
 * Build a successful API response payload.
 * @param {string} message - Human-readable success message.
 * @param {object} [data={}] - Additional response properties.
 * @returns {{success: true, message: string} & object}
 */
export const ok = (message, data = {}) => ({
  success: true,
  message,
  ...data,
});

/**
 * Build a failed API response payload.
 * @param {string} message - Human-readable error message.
 * @param {object} [data={}] - Additional response properties.
 * @returns {{success: false, message: string} & object}
 */
export const fail = (message, data = {}) => ({
  success: false,
  message,
  ...data,
});
