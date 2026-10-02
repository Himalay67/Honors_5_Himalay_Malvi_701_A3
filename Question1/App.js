const express = require("express")
// path is a Node.js module used to work with file and folder paths.
const path = require("path")
const multer = require("multer")
const {body, validationResult} = require("express-validator")
const app = express()
let users = []

// EJS Setup
app.set("view engine", "ejs")
// To find the Views folder.
app.set("views", path.join(__dirname, "Views"))

app.use(express.urlencoded({extended: true}))

// Create uploads folder automatically if it doesn't exist
const fs = require("fs")
// This checks whether the Uploads folder exists.
if (!fs.existsSync("Uploads")){
    // If it doesn't exist then it creates it.
    fs.mkdirSync("Uploads")
}

// Multer Setup
// diskStorage() means: Store uploaded files on the computer's disk.
const storage = multer.diskStorage({
    destination: function(req, res, cb){
        // cb means callback function.
        // Multer gives us this function so that we can tell Multer what to do with the file.

        // Callback (cb) is a function provided by Multer to tell it whether there is an error and what filename or folder should be used.
        cb(null, "Uploads/")
    },

    filename: function(req, file, cb){
        // file.originalname contains the original file name.
        // For example:
        //     photo.jpg

        //     Date.now() gives the current time in milliseconds.

        //     So the stored file could become:
        //     1758992345678 - photo.jpg

        //     This helps avoid two uploaded files having exactly the same name.
        const uniqueName = Date.now() + " - " + file.originalname
        // null       → No error
        // uniqueName → Use this name for the file
        cb(null, uniqueName)
    }
})

// File Validation
// This checks the type of uploaded file.
const fileFilter = function(req, file, cb){
    const allowedtypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];

    // This is the actual server-side validation.
    if (allowedtypes.includes(file.mimetype)){
        cb(null, true)
    }
    else{
        cb(new Error("Only JPG, JPEG and PNG images are allowed"))
    }
}

// This combines your Multer settings.
const upload = multer({
    // Tells Multer where and how to save files.
    storage: storage,
    // Tells Multer which file types are allowed.
    fileFilter: fileFilter,
    limits: {fileSize: 2 * 1024 * 1024} //2 MB
})


// This route opens the registration form.
app.get("/", function(req,res){
    // renders:
    //     Views/Form.ejs
    res.render("form", {
        // Initially there are no errors.
        errors: [],
        // There are no previous form values initially.
        old: {},
        files: {},
    })
})

app.post(
    "/register", 

    // You use: upload.fields([
    //     because you have two types of file uploads.
    upload.fields([
        {
            // Only one profile picture.
            name: "profilePic",
            maxCount: 1
        },
        {
            // Maximum 5 other pictures.
            name: "otherPics",
            maxCount: 5
        }
    ]),

    [
        body("username")
            // Removes unnecessary spaces from beginning and end.
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLength({min: 3, max: 20})
            .withMessage("Username must be 3-20 characters."),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({min: 6})
            .withMessage("Password must be at least 6 characters."),

        body("confirmPassword")
            .notEmpty()
            .withMessage("Confirm Password is required")
            // allows us to create our own validation.
            .custom((value, {req}) => {
                // value = confirm password
                // req.body.password = original password
                if (value !== req.body.password){
                    throw new Error("Passwords do not match.");
                }

                return true;
            }),

        body("email")
            .trim()
            .isEmail()
            .withMessage("Enter a valid email address."),

        body("gender")
            .notEmpty()
            .withMessage("Please select gender."),

        body("hobbies")
            // Express receives multiple hobbies as an array
            .isArray({ min: 1 })
            .withMessage("Please select at least one hobby.")
    ],

    function (req, res){
        // This collects all validation errors.
        const errors = validationResult(req);

        // File Validation
        // This stores file-related errors.
        let fileErrors = [];

        // This checks whether the profile picture was uploaded.
        if (!req.files || !req.files.profilePic){
            fileErrors.push("Profile picture is required");
        }

        // If normal validation or file validation fails
        // If normal form errors OR file errors exist.
        if (!errors.isEmpty() || fileErrors.length > 0){
            // combines both types of errors.
            const allErrors = [
                // express-validator stores all validation errors.
                // For example, suppose:

                //     Password is required
                //     Enter a valid email address
                //     Please select gender

                //     Then:
                //         errors.array() can contain something like:
                //         [
                //             { msg: "Password is required" },
                //             { msg: "Enter a valid email address" },
                //             { msg: "Please select gender" }
                //         ]

                //     Then:
                //         .map(error => error.msg)
                //         We only want the message from each error.

                //     So:
                //         errors.array().map(error => error.msg)
                //         becomes:
                //         [
                //             "Password is required",
                //             "Enter a valid email address",
                //             "Please select gender"
                //         ]
                // ... is called the spread operator.
                // It takes the elements from an array and puts them individually into another array.
                ...errors.array().map(error => error.msg),
                ...fileErrors
            ];

            // Display errors and old values
            // This sends the errors and previous form values to Form.ejs.
            // That's why when validation fails, values such as:
            //     Username
            //     Email
            //     Gender
            //     Hobbies
            // remain selected/filled.
            return res.render("Form", {
                errors: allErrors,
                old: req.body
            });
        }

        // All data is valid
        // res.render("Result", {
        //     data: req.body,
        //     profilePic: req.files.profilePic[0],
        //     otherPics: req.files.otherPics || []
        // });

        // If there are no errors, this creates one user object.
        const user = {
            data: req.body,
            profilePic: req.files.profilePic[0],
            // If no other pictures are uploaded, it uses an empty array.
            otherPics: req.files.otherPics || []
        };

        // This adds the user to: let users = [];
        users.push(user);

        // This sends the complete users array to: Result.ejs
        // Now EJS can display all users.
        res.render("Result", {
            users: users
        });
    }
);

// File download route
app.get("/download/:filename", function(req, res){
    const filePath = path.join(__dirname, "Uploads", req.params.filename);
    res.download(filePath, function(err){
        if (err){
            res.send("File Not Found");
        }
    })
})

// This allows you to directly visit: http://localhost:3000/users and see all registered users.
app.get("/users", function(req, res) {

    res.render("Result", {
        users: users
    });

});

// Show Uploaded Files
// This is important for displaying images.
app.use("/uploads", express.static("Uploads"));

// Error Handler
// This handles errors such as:
//     invalid file type
//     file too large
//     Multer errors
app.use(function(err, req, res, next){
    // sends the error back to the form.
    res.render("Form", {
        errors: [err.message],
        old: req.body || {}
    });
});

app.listen(3000, function(req, res){
    console.log("Server is running at http://localhost:3000")
});


// User opens /
//        ↓
// Form.ejs is displayed
//        ↓
// User enters details
//        ↓
// Clicks Register
//        ↓
// POST /register
//        ↓
// Multer handles images
//        ↓
// express-validator checks form
//        ↓
// Are there errors?
//    ↙             ↘
//  YES              NO
//  ↓                 ↓
// Show Form.ejs      Create user
// with errors        ↓
// and old values     users.push(user)
//                    ↓
//                 Result.ejs
//                    ↓
//              Display all users