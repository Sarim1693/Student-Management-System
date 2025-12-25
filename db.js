const mongoose=require('mongoose');
require('dotenv').config();
const mongoUrl=process.env.MONGO_URI;

mongoose.connect(mongoUrl)
    .then(()=>{
    console.log('Database Connected');
})

.catch((err)=>{
    console.log('Error while connecting the database', err);
})

const db=mongoose.connection;
db.on('disconnected', ()=>{
    console.log('Databse Disconnected');
})

module.exports=db;
