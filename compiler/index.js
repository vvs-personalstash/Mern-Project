const express = require("express")
const app =express()
const generateFile = require("./generateFile");
const executeCPP = require("./executeCPP");
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.post("/run",async (req,res)=>{
    // const code=req.body.code
    // const language=req.body.language
    //const input=req.body.input
    const { language = "cpp", code, input = "" } = req.body;
    if(code==undefined){        
        console.error("no input code provided");
        return res.status(400).json({success: false,error: "empty code provided"});
    }
    try {
        console.log("code: %s",code);
        const filePath=generateFile(code,language);
        const output=await executeCPP(filePath,input);
        console.log("output: %s",output);
        res.status(200).json({success: true,output: output});
    } catch (error) {
        res.status(500).json({success: false,error: error.message});
    }
    //console.log("code: %s",code);
})
app.listen(3000);