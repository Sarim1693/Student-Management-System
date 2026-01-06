const express=require('express');
const router=express.Router();
const User=require('./../models/userModel');
const bcrypt=require('bcrypt');
const professorVerify=require('./../middleware/professorAuth');
const Appointment=require('./../models/appointmentModel');
const userVerify=require('./../middleware/userVerify');
const jwt=require('jsonwebtoken')
router.post('/signup', async(req, res)=>{
    try{
        const {name, email, password, role}=req.body;
        if(!['student', 'professor', 'warden'].includes(role)){
            return res.status(400).json({message:"All Fields are required"});
        }
        const existing=await User.findOne({email});
        if(existing) return res.status(400).json({messgae: "User already exists"});
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);
        const newUser= new User({ name, email, password:hashedPassword, role});
        await newUser.save();
        res.status(200).json({message: "user Saved Successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: "Internal Server Error"});
    }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;


    const existing = await User.findOne({ email });
    if (!existing) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, existing.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
  { userId: existing._id, role: existing.role }, // 👈 userId
  process.env.JWT_SECRET_KEY,
  { expiresIn: '1h' }
);

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/addTimeSlot', userVerify, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (req.user.role !== 'professor' && req.user.role !== 'warden') {
      return res.status(403).json({
        message: "Only professor and warden can add timeslot"
      });
    }

    const appointmentGiver = req.user._id;
    const { startTime, endTime } = req.body;

    const st = new Date(startTime.replace(" ", "T"));
    const et = new Date(endTime.replace(" ", "T"));

    if (et <= st) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    if (st <= new Date()) {
      return res.status(400).json({ message: "Cannot add past time slot" });
    }

    const newSlot = new Appointment({
      appointmentGiver,
      appointmentTaker: null,
      startTime: st,
      endTime: et,
      isBooked: false
    });

    await newSlot.save();

    res.status(201).json({ message: "Time slot added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get('/:appointmentGiver/viewSlot', userVerify, async (req, res) => {
  try {
    const { appointmentGiver } = req.params;
    const user = req.user;

    const giver = await User.findById(appointmentGiver);
    if (!giver) {
      return res.status(404).json({ message: "Appointment giver not found" });
    }

    if (user.role === 'student' && giver.role !== 'professor') {
      return res.status(403).json({ message: "Students can only view professor slots" });
    }

    if (user.role === 'warden' && giver.role !== 'warden') {
      return res.status(403).json({ message: "Wardens can only view warden slots" });
    }

    const slots = await Appointment.find({
      appointmentGiver,
      isBooked: false,
      startTime: { $gt: new Date() }
    }).sort({ startTime: 1 });

    if (slots.length === 0) {
      return res.status(400).json({ message: "No Slot is available" });
    }

    const formattedSlots = slots.map(slot => ({
      startTime: slot.startTime.toLocaleString("en-IN", {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false
      }),
      endTime: slot.endTime.toLocaleString("en-IN", {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false
      })
    }));

    res.status(200).json({
      appointmentGiver,
      availableSlots: formattedSlots
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



router.post('/:appointmentGiver/book', userVerify, async(req, res)=>{
    try{
        const {appointmentGiver}=req.params;
        const user=req.user;
        if(user.role==='professor'){
            return res.status(403).json({message: "Professors acnnot book the appointment"});
        }
        const giver=await User.findById(appointmentGiver);
        if(!giver){
            return res.status(400).json({message: "Appointment Giver not foudn"});
        }
        if(user.role==='student' && giver.role!=='professor'){
            return res.status(403).json({message: "Students can only book professor slots"});
        }
        if(user.role==='warden' && giver.role!=='warden'){
            return res.status(403).json({message: "Wardens can only book with wardens"});
        }
        const appointment=await Appointment.findOne({appointmentGiver:appointmentGiver, isBooked:false});
        if(!appointment){
            return res.status(400).json({message: "no available slot for this user"});
        }
        appointment.appointmentTaker=req.user._id;
        appointment.isBooked=true;
        await appointment.save();
        res.status(200).json({message: "Appointment booked successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: "Internal Server error"});
    }
})


module.exports=router;