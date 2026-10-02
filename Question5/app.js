const express = require("express");
require("./libs/db");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer")
const Employee = require("./models/Employee");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const Leave = require("./models/Leave");

const app = express();

//ejs setup
app.set("view engine","ejs");

app.use(cors());

app.use(express.json());

//middleware
app.use(express.urlencoded({
    extended: true
}));

app.use(
    session({
        secret: "erp-secret",
        resave: false,
        saveUninitialized: false
    })
);

//admin login
app.get("/",(req,res) =>{
    res.render("login",{
        error: ""
    });
});

app.post("/login",(req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    //simple admin login
    if(username === "admin" &&  password === "admin123")
    {
        req.session.admin = username;
        res.redirect("/dashboard");
    }
    else
    {
        res.render("login",{
            error: "Invalid username or password"
        });
    }
});

//check admin session
function checklogin(req,res,next){
    if(req.session.admin)
    {
        next();
    }
    else
    {
        res.redirect("/");
    }
}

//dashboard/read
app.get("/dashboard",checklogin, async(req,res) => {
    const employees = await  Employee.find();

    res.render("dashboard",{
        employees: employees
    });
});

//add employee
app.get("/add",checklogin,(req,res) => {
    res.render("add");
});

app.post("/add",checklogin,async(req,res) =>{

    const{name,email,basicsalary} = req.body;
    
    //generate employee id
    const count = await Employee.countDocuments();
    const empid = "EMP" + String(count + 1).padStart(3,"0");

    //generate password
    const plainpassword =  Math.random().toString(36).slice(-8);

    //encrypt password
    const encryptedpassword = await bcrypt.hash(plainpassword,10);

    //salary calculation
    const basic = Number(basicsalary);
    const hra = basic * 0.20;
    const da = basic * 0.10;
    const grosssalary = basic + hra + da;

    //crate employee
    const employee = new Employee({
        empid: empid,
        name: name,
        email: email,
        password: encryptedpassword,
        basicsalary: basic,
        hra: hra,
        da: da,
        grosssalary : grosssalary
    });

    await employee.save();

    //send email
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "himalay7470@gmail.com",
            pass: "prqt dggf cpvt ghnn"
        }
    });

    const mailOptions = {
        from: "himalay7470@gmail.com",
        to: email,
        subject: "ERP Employee Account",
        text:
            "Hello " + name +
            ",\n\n" +
            "Your employee account has been created.\n\n" +
            "Employee ID: " + empid +
            "\nPassword: " + plainpassword +
            "\n\nPlease keep these details safe."
    };

    try
    {
        await transporter.sendMail(mailOptions);
        console.log("Email sent");
    }
    catch (error) 
    {
        console.log("Email error:", error.message);
    }

    res.redirect("/dashboard");

});

//edit employee
app.get("/edit/:id",checklogin,async(req,res) =>{
    const employee = await Employee.findById(req.params.id);

    res.render("edit",{
        employee: employee
    });
});

app.post("/edit/:id",checklogin,async(req,res) =>{
    const{name,email,basicsalary} = req.body;

    const basic = Number(basicsalary);
    const hra = basic * 0.20;
    const da = basic * 0.10;
    const grosssalary = basic + hra + da;

    await Employee.findByIdAndUpdate(
        req.params.id,{
            name: name,
            email: email,
            basicsalary: basic,
            hra: hra,
            da: da,
            grosssalary : grosssalary
        }
    );
    res.redirect("/dashboard");
});

//delete  employee
app.get("/delete/:id",checklogin, async (req, res) => {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard");
});

//logout
app.get("/logout",(req,res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// EMPLOYEE LOGIN USING JWT
app.post("/employee/login", async (req, res) => {

    const { empid, password } = req.body;

    // Find employee
    const employee = await Employee.findOne({
        empid: empid
    });

    if (!employee) {
        return res.json({
            message: "Employee not found"
        });
    }

    // Check password
    const match = await bcrypt.compare(
        password,
        employee.password
    );

    if (!match) {
        return res.json({
            message: "Invalid password"
        });
    }

    // Create JWT
    const token = jwt.sign(
        {
            empid: employee.empid
        },
        "employee-secret-key",
        {
            expiresIn: "1h"
        }
    );

    res.json({
        message: "Login successful",
        token: token
    });

});

// CHECK JWT
function checkEmployee(req, res, next) {
    const token = req.headers.authorization;
    if (!token) 
    {
        return res.status(401).json({
            message: "Please login first"
        });

    }
    try {

        const decoded = jwt.verify(
            token,
            "employee-secret-key"
        );

        req.empid = decoded.empid;

        next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid token"
        });

    }

}

// EMPLOYEE PROFILE
app.get(
    "/employee/profile",
    checkEmployee,
    async (req, res) => {

        const employee = await Employee.findOne({
            empid: req.empid
        }).select("-password");

        res.json(employee);

    }
);

// ADD LEAVE
app.post(
    "/employee/leave",
    checkEmployee,
    async (req, res) => {

        const {
            date,
            reason,
            grant
        } = req.body;

        const leave = new Leave({

            empid: req.empid,

            date: date,

            reason: reason,

            grant: grant

        });

        await leave.save();

        res.json({
            message: "Leave added successfully"
        });

    }
);

// LIST LEAVE
app.get(
    "/employee/leave",
    checkEmployee,
    async (req, res) => {

        const leaves = await Leave.find({
            empid: req.empid
        });

        res.json(leaves);
    }
);

//start server
app.listen(3000,() => {
    console.log("Server running at http://localhost:3000");
});