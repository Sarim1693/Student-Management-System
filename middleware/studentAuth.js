const studentVeirfy=(req, res, next)=>{
    if(req.user.role!=='student'){
        return res.status(403).json({message: "Only stduents area allowed"});
    };
    next();
}
module.exports=studentVeirfy;