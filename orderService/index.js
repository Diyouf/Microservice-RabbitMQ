const express = require('express');
const app = express();
const mongoose = require('mongoose');

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/MicroservicesOrder')
    .then(() => {
        console.log("Database connected and Working");
    })
    .catch((error) => {
        console.error("Error connecting to database:", error);
    });

app.listen(3001,()=>{
    console.log('order Service running at 3001 ')
})