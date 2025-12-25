const jwt=require('jsonwebtoken');
const Student=require('./../models/studentModel');
require('dotenv').config();
const studentVerify=async(req, res, next)=>{
    try{
        const token=req.headers.authorization.split(' ')[1];
        if(!token) res.status(201).json({message: "Nno Token Provided"});

        const decoded= jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user= await Student.findById(decoded.user_id);
        if(!user) res.status(401).json({message: "Invalid Token"});

        req.user=user;
        next();
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: "Unauthorized"});
    }
}
module.exports=studentVerify;