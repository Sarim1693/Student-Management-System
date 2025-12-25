const jwt=require('jsonwebtoken');
const Professor=require('./../models/professorModel');
require('dotenv').config();

const professorVerify=async(req, res, next)=>{
    try{
        const token=req.headers.authorization.split(' ')[1];
        if(!token) return res.status(401).json({message: "No token Provided"});

        const decoded=jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user=await Professor.findById(decoded.user_id);
        if(!user) return res.status(401).json({message: "inavlid User"});

        req.user=user;
        next();
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: "Unauhtorized Access"});
    }
}

module.exports=professorVerify;