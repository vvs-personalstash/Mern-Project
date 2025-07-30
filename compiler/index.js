const express = require("express")
const app = express()
const generateFile = require("./generateFile");
const executeCPP = require("./executeCPP");
const { createCompilerRateLimit, createGeneralRateLimit, RATE_LIMIT_CONFIG } = require("./rateLimitConfig");
const { rateLimitLogger, requestLogger } = require("./middleware");

// Trust proxy for proper rate limiting behind nginx
app.set('trust proxy', true);

// Create rate limiters
const compilerRateLimit = createCompilerRateLimit();
const generalRateLimit = createGeneralRateLimit();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);
app.use(rateLimitLogger);

app.use(generalRateLimit);


app.post("/run", compilerRateLimit, async (req,res)=>{
    const { language = "cpp", code, input = "" } = req.body;
    if(code==undefined){        
        console.error("no input code provided");
        return res.status(400).json({success: false,error: "empty code provided"});
    }
    try {
        const startTime = Date.now();
        console.log("code: %s",code);
        const filePath=generateFile(code,language);
        const output=await executeCPP(filePath,input);
        const executionTime = Date.now() - startTime;
        console.log("output: %s",output);
        console.log(`Compilation completed in ${executionTime}ms`);
        res.status(200).json({
            success: true,
            output: output,
            executionTime: `${executionTime}ms`
        });
    } catch (error) {
        console.error("Compilation error:", error.message);
        res.status(500).json({success: false,error: error.message});
    }
    //console.log("code: %s",code);
})

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Compiler API is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get("/rate-limit-status", (req, res) => {
    res.status(200).json({
        success: true,
        rateLimits: {
            compilation: {
                windowMs: RATE_LIMIT_CONFIG.COMPILER.windowMs,
                maxRequests: RATE_LIMIT_CONFIG.COMPILER.max,
                endpoint: "/run",
                window: "1 minute"
            },
            general: {
                windowMs: RATE_LIMIT_CONFIG.GENERAL.windowMs,
                maxRequests: RATE_LIMIT_CONFIG.GENERAL.max,
                allEndpoints: true,
                window: "1 minute"
            }
        },
        message: "Rate limiting is active",
        clientIP: req.ip,
        headers: {
            rateLimit: req.get('RateLimit-Limit'),
            rateLimitRemaining: req.get('RateLimit-Remaining'),
            rateLimitReset: req.get('RateLimit-Reset')
        }
    });
});

app.get("/logs/:type", (req, res) => {
    const fs = require('fs');
    const path = require('path');
    
    try {
        const logType = req.params.type;
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(__dirname, 'logs', `${logType}-${today}.log`);
        
        if (!fs.existsSync(logFile)) {
            return res.status(404).json({
                success: false,
                message: `No ${logType} logs found for today`,
                date: today
            });
        }
        
        const logs = fs.readFileSync(logFile, 'utf8')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return { rawLine: line };
                }
            });
        
        res.status(200).json({
            success: true,
            logType: logType,
            date: today,
            totalEntries: logs.length,
            logs: logs.slice(-50) // Return last 50 entries
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/logs", (req, res) => {
    req.params.type = 'requests';
    const fs = require('fs');
    const path = require('path');
    
    try {
        const logType = 'requests';
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(__dirname, 'logs', `${logType}-${today}.log`);
        
        if (!fs.existsSync(logFile)) {
            return res.status(404).json({
                success: false,
                message: `No ${logType} logs found for today`,
                date: today
            });
        }
        
        const logs = fs.readFileSync(logFile, 'utf8')
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return { rawLine: line };
                }
            });
        
        res.status(200).json({
            success: true,
            logType: logType,
            date: today,
            totalEntries: logs.length,
            logs: logs.slice(-50) // Return last 50 entries
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(3000, () => {
    console.log("Compiler API server running on port 3000");
    console.log("Rate limiting enabled:");
    console.log("- /run endpoint: 10 requests per minute per IP");
    console.log("- All endpoints: 50 requests per minute per IP");
});