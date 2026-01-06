const professorOrwarden=(req, res, next)=>{
    if(req.user.role!=='professor' && req.user.role!=='warden'){
        return res.status(403).json({message: "Only Porfessor and warden alloed"});
    }
    next();
}
moduel.exports=professorOrwarden;