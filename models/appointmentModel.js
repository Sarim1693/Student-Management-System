const mongoose=require('mongoose');
const appointmentSchemna=new mongoose.Schema({
    appointmentGiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    appointmentTaker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:null
    },
    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
        required:true
    },
    isBooked:{
        type:Boolean,
        default:false
    }
});
const Appointment=mongoose.model('Appointment', appointmentSchemna);
module.exports=Appointment;