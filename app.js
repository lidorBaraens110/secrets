//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


app.use(session({
    secret: "our little secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set("useCreateIndex", true);

const userScheme = new mongoose.Schema({
    email: String,
    password: String
});

userScheme.plugin(passportLocalMongoose);

const User = mongoose.model("User", userScheme);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
    res.render("home");
})

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        console.log("working")
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", (req, res) => {

    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            })
        }
    })

})

app.post("/login", (req, res) => {

    const newUser = new User({ username: req.body.username, password: req.body.password });
    req.login(newUser, function (err) {
        if (err) {
            console.log(err), res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            })
        }
    })
})

app.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/")
})
app.listen(3000, (req, res) => {
    console.log("we are using port 3000");
})