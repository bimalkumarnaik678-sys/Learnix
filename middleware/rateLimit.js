import rateLimit from 'express-rate-limit';

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Strict rate limiter for quiz submissions
export const quizSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 quiz submissions per hour
  message: 'Too many quiz submissions. Please try again later.',
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  // Custom key generator to rate limit per user instead of IP
  keyGenerator: (req) => {
    return req.user?._id?.toString() || req.ip;
  },
});