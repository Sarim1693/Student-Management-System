const mongoose=require('mongoose');
const professorSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});

const Professor=mongoose.model('Professor', professorSchema);
module.exports=Professor;