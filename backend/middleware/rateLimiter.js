import { ApiResponse } from "../utils/Apiresponse.js";

/**
 * Lightweight in-memory rate limiting middleware.
 * Prevents endpoint spam, brute force attempts, and abuse (Audit Issue §6.4).
 *
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60,000ms = 1m)
 * @param {number} options.max - Maximum number of allowed requests in the window (default: 60)
 * @param {string} options.message - Error message when rate limit is exceeded
 */
export const rateLimit = ({
  windowMs = 60 * 1000,
  max = 60,
  message = "Too many requests. Please slow down and try again later.",
} = {}) => {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of hits.entries()) {
      const active = timestamps.filter((t) => now - t < windowMs);
      if (active.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, active);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const key = req.user?._id ? String(req.user._id) : (req.ip || req.socket.remoteAddress || "global");
    const now = Date.now();

    const timestamps = hits.get(key) || [];
    const windowStart = now - windowMs;
    const recentHits = timestamps.filter((t) => t > windowStart);

    if (recentHits.length >= max) {
      const retryAfterSec = Math.ceil((recentHits[0] + windowMs - now) / 1000);
      res.setHeader("Retry-After", Math.max(1, retryAfterSec));
      return res.status(429).json(new ApiResponse(429, null, message));
    }

    recentHits.push(now);
    hits.set(key, recentHits);
    next();
  };
};
