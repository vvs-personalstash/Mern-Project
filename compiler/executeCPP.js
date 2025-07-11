const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const outputPath = path.join(__dirname, "output");
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCPP = (filepath, input = "") => {
    return new Promise((resolve, reject) => {
        const jobID = path.basename(filepath).split(".")[0];
        const outPath = path.join(outputPath, `${jobID}.out`);

        // Step 1: Compile the code
        const compileCmd = `g++ "${filepath}" -o "${outPath}"`;
        const exec = require("child_process").exec;
        exec(compileCmd, (compileErr, stdout, stderr) => {
            if (compileErr) {
                console.error(`Compile error: ${compileErr.message}`);
                return reject(new Error(stderr || compileErr.message));
            }
            if (stderr) {
                console.error(`Compile stderr: ${stderr}`);
            }

            // Run the compiled program with input using spawn
            const runProcess = spawn(outPath);

            let output = "";
            let errorOutput = "";

            // Send input to the program's stdin
            if (input) {
                runProcess.stdin.write(input);
            }
            runProcess.stdin.end();
            runProcess.stdout.on("data", (data) => {
                output += data.toString();
            });
            runProcess.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            runProcess.on("close", (code) => {
                if (code !== 0) {
                    return reject(new Error(errorOutput || `Process exited with code ${code}`));
                }
                resolve(output);
            });

            runProcess.on("error", (err) => {
                reject(err);
            });
        });
    });
};

module.exports = executeCPP;
