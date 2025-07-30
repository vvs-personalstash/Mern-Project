const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Rate limit logging middleware
const rateLimitLogger = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        // Check if this is a rate limit response
        if (res.statusCode === 429) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                ip: req.ip,
                endpoint: req.path,
                method: req.method,
                userAgent: req.get('User-Agent'),
                message: 'Rate limit exceeded'
            };
            
            // Log to file
            const logFile = path.join(logsDir, `rate-limit-${new Date().toISOString().split('T')[0]}.log`);
            fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            
            // Log to console
            console.log(`🚨 RATE LIMIT: ${req.ip} exceeded limit on ${req.method} ${req.path}`);
        }
        
        originalSend.call(this, data);
    };
    
    next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logEntry = {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            method: req.method,
            endpoint: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent')
        };
        
        // Log all requests to daily file
        const logFile = path.join(logsDir, `requests-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
        
        // Console log for important events
        if (res.statusCode >= 400) {
            console.log(`⚠️  ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
        } else if (req.path === '/run') {
            console.log(`✅ COMPILE: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
        }
    });
    
    next();
};

module.exports = {
    rateLimitLogger,
    requestLogger
};
