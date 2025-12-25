const mongoose=require('mongoose');
const appointmentSchemna=new mongoose.Schema({
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Student',
        required:true
    },
    profId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Professor',
        required:true
    },
    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        enum:['booked', 'cancelled', 'completed'],
        default:'booked'
    }
});
const Appointment=mongoose.model('Appointment', appointmentSchemna);
module.exports=Appointment;