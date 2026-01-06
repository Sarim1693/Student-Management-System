const wardenVerify=(req, res, next)=>{
    if(req.user.role!=='warden'){
        return res.status(403).json({message: "Only wardens area allowed"});
    };
    next();
}
module.exports=wardenVerify;