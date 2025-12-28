const express=require('express');
const router=express.Router();
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const Student=require('./../models/studentModel');
const studentVerify=require('./../middleware/studentAuth');
const available=require('./../models/availabilityModel');
const Appointment=require('./../models/appointmentModel');
const Available = require('./../models/availabilityModel');
require('dotenv').config();
router.post('/signup', async(req , res)=>{
    try{
        const {name, age,username, password}=req.body;
        const existing=await Student.findOne({username});
        if(existing) res.status(400).json({message: "Student Already Exists"});
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);
        const newStudent= await Student({name, age, username, password:hashedPassword});
        await newStudent.save();

        res.status(200).json({message: "Student Saved Successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: "Internal Server Error"});
    }
});

router.post('/login', async(req, res)=>{
    try{
        const {username, password}=req.body;
        const existing=await Student.findOne({username});
        if(!existing) return res.status(400).json({message: "Student Does not exists"});

        const isMatch= await bcrypt.compare(password, existing.password);
        if(!isMatch) return res.status(400).json({message: "Invalid Credentials"});

        const token=jwt.sign(
            {user_id:existing._id, username:existing.name},
            process.env.JWT_SECRET_KEY,
            {expiresIn:'1h'}
        )

        return res.status(200).json({message:"Login done successfully", token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({err:"Internal Server Error"});
    }
})

router.get('/:profId/viewSlot', studentVerify, async(req, res)=>{
    try{
        const {profId}=req.params;
        const slots=await available.find({profId});
        if(slots.length===0) {
            return res.status(400).json({message: "No Slot is available"});
        }
        const formattedSlots=slots.map(slot=>({
            startTime:slot.startTime.toLocaleString("en-IN",{
                timeZone:'Asia/Kolkata',
                hour:'2-digit',
                minute:'2-digit',
                second:'2-digit',
                day:'2-digit',
                month:'2-digit',
                year:'numeric',
                hour12:false
            }),
            endTime:slot.endTime.toLocaleString("en-IN", {
                timeZone:'Asia/Kolkata',
                hour:'2-digit',
                minute:'2-digit',
                second:'2-digit',
                day:'2-digit',
                month:'2-digit',
                year:'numeric',
                hour12:false
            })
        }));

        res.status(200).json({message:"The Available slots are: ", formattedSlots});
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: "Internal Server Error"});
    }
});

router.post('/:profId/book', studentVerify, async(req, res)=>{
    try{
        const {profId}=req.params;
        const studentId=req.user._id;
        const {startTime, endTime}=req.body;

        const st=new Date(startTime.replace(" ", "T"));
        const et=new Date(endTime.replace(" ", "T"));

        const slot= await available.findOne({
            profId,
            startTime:{$lte:st},
            endTime:{$gte:et}
        });

        if(!slot){
            return res.status(400).json({message: "No Slot Available"});
        }

        const bookingExists=await Appointment.findOne({
            profId,
            startTime:{$lt:et},
            endTime:{$gt:st}
        });
        if(bookingExists){
            return res.status(409).json({message: "Slot is already booked"});
        }

        const appointment=await Appointment({
            studentId,
            profId,
            startTime:st,
            endTime:et
        });
        await appointment.save();
        res.status(200).json({message: "Appointment Booked Sccessfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: "Internal Server Error"});
    }
})


router.get('/viewAllAppointments', studentVerify, async(req, res)=>{
    try{
        const studentId=req.user._id;
        const appointments=await Appointment.find({
            studentId,
            status:'booked'
        });
        if(appointments.length===0){
            return res.status(400).json({message:"No appointment Booked"});
        }
        const formattedAppointments=appointments.map(appt=>({

            startTime:appt.startTime.toLocaleString("en-IN", {
                timezone:"Asia/Kolkata",
                hour:"2-digit",
                minute:"2-digit",
                second:"2-digit",
                day:"2-digit",
                month:"2-digit",
                year:"numeric",
                hour12:false
            }),
            endTime:appt.endTime.toLocaleString("en-IN",{
                timezone:"Asia/Kolkata",
                hour:"2-digit",
                minute:"2-digit",
                second:"2-digit",
                day:"2-digit",
                month:"2-digit",
                year:"numeric",
                hour12:false
            })
        }))
        res.status(200).json({message:"The Appointments are: ", formattedAppointments});
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: "Internal Server Error"});
    }
})

module.exports=router;