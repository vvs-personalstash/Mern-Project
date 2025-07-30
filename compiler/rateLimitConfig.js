const rateLimit = require("express-rate-limit");

const RATE_LIMIT_CONFIG = {
    COMPILER: {
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 10, // 10 requests per minute
        message: {
            success: false,
            error: "Too many compilation requests from this IP, please try again after a minute.",
            retryAfter: "1 minute",
            limit: 10,
            window: "1 minute"
        }
    },
    GENERAL: {
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 50, // 50 requests per minute
        message: {
            success: false,
            error: "Too many requests from this IP, please try again later.",
            retryAfter: "1 minute",
            limit: 50,
            window: "1 minute"
        }
    },
    
    STRICT: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 5, // 5 requests per 5 minutes
        message: {
            success: false,
            error: "Rate limit exceeded. Maximum 5 compilation requests per 5 minutes.",
            retryAfter: "5 minutes",
            limit: 5,
            window: "5 minutes"
        }
    }
};

// Create rate limiters
const createCompilerRateLimit = (config = RATE_LIMIT_CONFIG.COMPILER) => {
    return rateLimit({
        windowMs: config.windowMs,
        max: config.max,
        message: config.message,
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: false,
        handler: (req, res) => {
            console.log(`Rate limit exceeded for IP: ${req.ip} on ${new Date().toISOString()}`);
            res.status(429).json(config.message);
        },
        skip: (req) => {
            if (process.env.NODE_ENV === 'development' && (req.ip === '::1' || req.ip === '127.0.0.1')) {
                return true;
            }
            return false;
        }
    });
};

const createGeneralRateLimit = (config = RATE_LIMIT_CONFIG.GENERAL) => {
    return rateLimit({
        windowMs: config.windowMs,
        max: config.max,
        message: config.message,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            console.log(`General rate limit exceeded for IP: ${req.ip} on ${new Date().toISOString()}`);
            res.status(429).json(config.message);
        }
    });
};

module.exports = {
    RATE_LIMIT_CONFIG,
    createCompilerRateLimit,
    createGeneralRateLimit
};
