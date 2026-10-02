const express = require("express");
const session = require("express-session");
const { createClient } = require("redis");
const { RedisStore } = require("connect-redis");
 
const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));

// Redis Connection
const redisClient = createClient();
redisClient.connect().catch(console.error);

app.use(session({
    store: new RedisStore({
        client: redisClient
    }),
    secret: "abc",
    resave: false,
    saveUninitialized: false
}));

// Login Page
app.get("/", function(req, res){
    res.render("Login");
});

// Login
app.post("/login", function(req, res){
    if (req.body.username == "admin" && req.body.password == "12345"){
        req.session.login = true;
        req.session.username = req.body.username;

        res.redirect("/home");
    }
    else{
        res.send("Invalid username or password");
    }
});

// Check Login
function checkLogin(req, res, next){
    if (req.session.login){
        next();
    }
    else{
        res.redirect("/");
    }
}

// Protected Route 1
app.get("/home", checkLogin, function(req, res){
    res.render("Home", { username: req.session.username });
});

// Protected Route 2
app.get("/profile", checkLogin, function(req, res){
    res.render("Profile", { username: req.session.username });
});

// Logout
app.get("/logout", function(req, res){
    req.session.destroy();
    res.redirect("/");
});

app.listen(3000, function(){
    console.log("Server is running on PORT 3000");
});