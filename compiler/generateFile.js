const fs=require("fs");
const path=require("path");
const {v4}=require("uuid")

const dirCodes=path.join(__dirname,"codes");
if(!fs.existsSync(dirCodes)){
        fs.mkdirSync(dirCodes,{recursive: true});
}
const generateFile=(code, language)=>{
    const jobID=v4();
    const filePath = path.join(dirCodes, `${jobID}.${language}`);
    fs.writeFileSync(filePath,code);
    return filePath;
}

module.exports= generateFile;