const express = require("express");
const { Sequelize } = require("sequelize");
const cors = require("cors");

const studentModel = require("./Student");

const app = express();

app.use(express.json());
app.use(cors());

const sequelize = new Sequelize("studentdb", "root", "", {
    host: "localhost",
    dialect: "mysql"
});

const Student = studentModel(sequelize);

sequelize.sync().then(function() {
    console.log("Database connected");
});

// CREATE
app.post("/students", async function(req, res) {
    const student = await Student.create(req.body);
    res.json(student);
});

// READ
app.get("/students", async function(req, res) {
    const students = await Student.findAll();
    res.json(students);
});

// UPDATE
app.put("/students/:id", async (req, res) => {
    await Student.update(req.body, {
        where: {
            id: req.params.id
        }
    });

    res.json({ message: "Student Updated" });
});

// DELETE
app.delete("/students/:id", async (req, res) => {
    await Student.destroy({
        where: {
            id: req.params.id
        }
    });

    res.json({ message: "Student Deleted" });
});

app.listen(5000, function() {
    console.log("Server is running on PORT 5000");
});