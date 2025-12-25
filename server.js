const express=require('express');
const app=express();
require('dotenv').config();
app.use(express.json());
const db= require('./db');
const PORT=process.env.PORT || 3000
const studentRoutes=require('./routes/student');
app.use('/students', studentRoutes);
const professorRoutes=require('./routes/professor');
app.use('/professor', professorRoutes);
app.listen(PORT, ()=>{
    console.log('Server is running');
});