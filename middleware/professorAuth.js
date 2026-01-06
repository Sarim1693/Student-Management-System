const professorVerify=(req, res, next)=>{
    if(req.user.role!=='professor'){
        return res.status(403).json({message: "Only professor area allowed"});
    };
    next();
}

module.exports=professorVerify;