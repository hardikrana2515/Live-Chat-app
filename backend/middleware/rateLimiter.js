import { ApiResponse } from "../utils/Apiresponse.js";

/**
 * Hardened Production Rate Limiting Middleware (Audit H8).
 * Supports reverse proxies (X-Forwarded-For), per-user/per-IP scoping,
 * standard rate-limit headers (Limit, Remaining, Reset, Retry-After),
 * and memory-bounded LRU cleanup.
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
  // Map of identifier -> array of timestamps
  const hits = new Map();
  const MAX_TRACKED_ENTRIES = 10000;

  // Cleanup expired entries periodically
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of hits.entries()) {
      const active = timestamps.filter((t) => now - t < windowMs);
      if (active.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, active);
      }
    }
    // Hard cap size if under sustained distributed probing
    if (hits.size > MAX_TRACKED_ENTRIES) {
      const toDelete = hits.size - MAX_TRACKED_ENTRIES;
      let count = 0;
      for (const key of hits.keys()) {
        if (count++ >= toDelete) break;
        hits.delete(key);
      }
    }
  }, 60 * 1000);

  if (cleanupTimer.unref) cleanupTimer.unref();

  return (req, res, next) => {
    // Extract real client IP through reverse proxies (e.g. Nginx, Cloudflare)
    const forwarded = req.headers["x-forwarded-for"];
    const realIp = forwarded
      ? String(forwarded).split(",")[0].trim()
      : req.ip || req.socket.remoteAddress || "127.0.0.1";

    // Scope by authenticated user ID if present; fallback to real client IP
    const key = req.user?._id ? `user:${req.user._id}` : `ip:${realIp}`;
    const now = Date.now();

    const timestamps = hits.get(key) || [];
    const windowStart = now - windowMs;
    const recentHits = timestamps.filter((t) => t > windowStart);

    const remaining = Math.max(0, max - recentHits.length);
    const resetTime = Math.ceil((now + windowMs) / 1000);

    // Standard rate limit headers
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetTime);

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
