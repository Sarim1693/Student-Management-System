const express=require('express');
const router=express.Router();
const Professor=require('./../models/professorModel');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const professorVerify=require('./../middleware/professorAuth');
const available=require('./../models/availabilityModel');
const Appointment=require('./../models/appointmentModel');
require('dotenv').config();
router.post('/signup', async(req, res)=>{
    try{
        const {name, email, password}=req.body;
        const existing=await Professor.findOne({email});
        if(existing) return res.status(400).json({messgae: "Professor already exists"});
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);
        const newUser= new Professor({ name, email, password:hashedPassword});
        await newUser.save();
        res.status(200).json({message: "user Saved Successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: "Internal Server Error"});
    }
});
router.post('/login', async(req, res)=>{
    try{
        const {email, password}=req.body;
        const existing=await Professor.findOne({email});
        if(!existing) return res.status(400).json({messgae: "Professor does not exists"});

        const isMatch=await bcrypt.compare(password, existing.password);
        if(!isMatch) return res.status(400).json({message: "Invalid Credentials"});

        const token= jwt.sign(
            {user_id:existing._id, username:existing.name},
            process.env.JWT_SECRET_KEY,
            {expiresIn:'1h'}
        )
        res.status(200).json({message: "Login Successfully", token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: "Internal Server Error"});
    }
})

router.post('/addTimeSlot', professorVerify, async (req, res) => {
  try {
    const profId = req.user._id;
    const { startTime, endTime } = req.body;

    const st = new Date(startTime.replace(" ", "T"));
    const et = new Date(endTime.replace(" ", "T"));

    if (et <= st) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    const newTime = new available({
      profId,
      startTime: st,
      endTime: et
    });

    await newTime.save();

    res.status(200).json({ message: "Time slot added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Internal Server Error" });
  }
});

router.patch('/:studentId/cancel', professorVerify, async(req, res)=>{
    try{
        const {studentId}=req.params;
        const profId=req.user._id;
        const existing=await Appointment.findOne({
            studentId,
            profId,
            status:'booked'
        });
        if(!existing){
            return res.status(404).json({message: "No Such appointment exists"});
        }
        existing.status='cancelled';
        await existing.save();

        await available.findOneAndDelete({
            profId,
            startTime:existing.startTime,
            endTime:existing.endTime
        });
        res.status(200).json({message:"Appointment Cancelled Successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: "Internal Server Error"});
    }
});


module.exports=router;