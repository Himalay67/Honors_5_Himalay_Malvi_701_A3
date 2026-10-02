import React, { useEffect, useState } from 'react'

function App() {
  const [students, setStudents] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");


  function getStudents(){
    fetch("http://localhost:5000/students")
    .then(response => response.json())
    .then(data => setStudents(data));
  }

  useEffect(function() {
    getStudents();
  }, []);

  function addStudent() {
    fetch("http://localhost:5000/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name: name,
        email: email, 
        course: course
      })
    })

    .then(response => response.json())
    .then(function() {
      getStudents();
  
      setName("");
      setEmail("");
      setCourse("");
    });
  }

  function updateStudent(id) {
    fetch("http://localhost:5000/students/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name: "Updated Name",
        email: "updated@gmail.com",
        course: "MCA"
      })
    })

    .then(() => {
      getStudents();
    })
  }

  function deleteStudent(id) {
    fetch("http://localhost:5000/students/" + id, {
      method: "DELETE"
    })

    .then(() => {
      getStudents();
    })
  }

  return (
    <>
      <div>
        <h2>Student CRUD</h2>

        <label>Name:</label>
        <input placeholder='Name' value={name} onChange={e => setName(e.target.value)} />
        <br /><br />

        <label>Email:</label>
        <input placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
        <br /><br />

        <label>Course:</label>
        <input placeholder='Course' value={course} onChange={e => setCourse(e.target.value)} />
        <br /><br />

        <button onClick={addStudent}>
          Add Student
        </button>

        <h3>Student List</h3>

        {students.map(function(student) {
          return (
            <div key={student.id}>
              {student.name} - 
              {student.email} - 
              {student.course}

              <button onClick={() => updateStudent(student.id)}>
                Update
              </button>

              <button onClick={() => deleteStudent(student.id)}>
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App