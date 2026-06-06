// Centralized error handling middleware for consistent API responses.

import { fail } from "../utils/apiResponse.js";

/**
 * Handles unknown routes.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const notFoundHandler = (req, res) => {
  return res.status(404).json(fail(`Route not found: ${req.originalUrl}`));
};

/**
 * Converts thrown errors into consistent JSON responses.
 * @param {Error & {statusCode?: number}} err
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json(
    fail(message, {
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    }),
  );
};
