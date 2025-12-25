const mongoose=require('mongoose');
const availableSchema=new mongoose.Schema({
    profId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Professor'
    },
    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
        required:true
    }
});
const Available=mongoose.model('Available', availableSchema);
module.exports=Available;