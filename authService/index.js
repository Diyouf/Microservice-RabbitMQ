const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require("./userModel");
const jwt = require("jsonwebtoken");

app.use(express.json());


// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/MicroservicesAuth')
    .then(() => {
        console.log("Database connected and Working");
    })
    .catch((error) => {
        console.error("Error connecting to database:", error);
    });


app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ message: "User doesn't exist" });
    } else {
        if (password !== user.password) {
            return res.json({ message: "Password Incorrect" });
        }
        const payload = {
            email,
            name: user.name
        };
        jwt.sign(payload, "secret", (err, token) => {
            if (err) console.log(err);
            else return res.json({ token: token });
        });
    }
});

app.post("/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.json({ message: "User already exists" });
    } else {
        const newUser = new User({
            email,
            name,
            password,
        });
        newUser.save();
        return res.json(newUser);
    }
});



process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

// Start Express server
app.listen(3000, () => {
    console.log('Auth service running at port 3000');
});
