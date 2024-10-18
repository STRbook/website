const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to PostgreSQL
const pool = new Pool({
  user: 'postgres',       // Your PostgreSQL username
  host: 'localhost',       // Hostname
  database: 'str_book',  // Your database name
  password: 'pg',        // Your PostgreSQL password
  port: 5432,              // PostgreSQL port
});

// Test the DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Database connected:', res.rows);
  }
});

// Example route
app.get('/', (req, res) => {
  res.send('Server is up and running');
});


// Add a student API endpoint
app.post('/api/students', async (req, res) => {
    const { name, roll_no, email, usn } = req.body;

    try {
        // Insert the student into the database
        const newStudent = await pool.query(
            'INSERT INTO students (name, roll_no, email, usn) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, roll_no, email, usn]
        );
        // Respond with the newly added student
        res.json(newStudent.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});




// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
