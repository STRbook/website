const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to PostgreSQL
const pool = new Pool({
  user: 'postgres',       // Your PostgreSQL username
  host: 'localhost',      // Hostname
  database: 'str_book',   // Your database name
  password: 'pg',         // Your PostgreSQL password
  port: 5432,             // PostgreSQL port
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
  const { name, usn, email, gender, nationality, religion, caste, dob, phone, hobbies, profile_picture_url, password } = req.body;

  try {
    // Insert the student into the database
    const newStudent = await pool.query(
      'INSERT INTO student_profile (name, usn, email, gender, nationality, religion, caste, dob, phone, hobbies, profile_picture_url, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [name, usn, email, gender, nationality, religion, caste, dob, phone, hobbies, profile_picture_url, password]
    );
    // Respond with the newly added student
    res.json(newStudent.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add a registration API endpoint
app.post('/api/register', async (req, res) => {
  const { email, password, name, usn, gender, nationality, religion, caste, dob, phone, hobbies, profile_picture_url } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const saltRounds = 10;

  try {
    // Check if the email already exists
    const existingUser = await pool.query('SELECT * FROM student_profile WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const newUser = await pool.query(
      'INSERT INTO student_profile (email, password, name, usn, gender, nationality, religion, caste, dob, phone, hobbies, profile_picture_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [email, hashedPassword, name, usn, gender, nationality, religion, caste, dob, phone, hobbies, profile_picture_url]
    );

    // Generate JWT
    const token = jwt.sign({ id: newUser.rows[0].id, email: newUser.rows[0].email }, 'your_jwt_secret', { expiresIn: '1h' });

    // Respond with the newly registered user
    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add a login API endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await pool.query('SELECT * FROM student_profile WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, 'jwt_secret', { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Example protected route
app.get('/api/student-profile', authenticateToken, (req, res) => {
  //logic to get student profile
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});