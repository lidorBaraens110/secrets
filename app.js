//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const md5 = require('md5');

console.log(process.env.API_KEY)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true })

const userScheme = new mongoose.Schema({
    email: String,
    password: String
});

//userScheme.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


const User = mongoose.model("User", userScheme);



app.get("/", (req, res) => {
    res.render("home");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save(err => {
        if (!err) {
            res.render("secrets");
        } else {
            console.log(err);
            res.redirect("register");
        }
    })
})

app.post("/login", (req, res) => {
    const userName = req.body.username;
    const pass = md5(req.body.password);

    User.findOne({ email: userName }, (err, result) => {
        if (!err) {
            if (pass === result.password) {
                console.log("success")
                res.render("secrets");
            }
        } else { console.log(err) }
    })
})
app.listen(3000, (req, res) => {
    console.log("we are using port 3000");
})