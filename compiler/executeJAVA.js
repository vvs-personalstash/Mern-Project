const fs = require("fs");
const path = require("path");
const outputPath = path.join(__dirname, "output");
if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
}

const executeJAVA = (filePath) => {
    const jobID = path.basename(filePath, path.extname(filePath));
    const outputFilePath = path.join(outputPath, `${jobID}.out`);

    return new Promise((resolve, reject) => {
        const exec = require("child_process").exec;
        exec(`javac ${filePath} && java -cp ${path.dirname(filePath)} ${jobID} > ${outputFilePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing code: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.error(`Error in code execution: ${stderr}`);
                return reject(new Error(stderr));
            }
            fs.readFile(outputFilePath, 'utf8', (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    });
}

module.exports = executeJAVA;