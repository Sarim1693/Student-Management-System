const express=require('express');
const app=express();
require('dotenv').config();
app.use(express.json());
const db= require('./db');
const PORT=process.env.PORT || 3000
// const studentRoutes=require('./routes/student');
// app.use('/students', studentRoutes);
// const professorRoutes=require('./routes/professor');
// app.use('/professor', professorRoutes);
const userRoutes=require('./routes/user');
app.use('/user', userRoutes);
app.listen(PORT, ()=>{
    console.log('Server is running');
});