const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Removed unused Pool import: const { Pool } = require('pg');

const router = express.Router();

// Function to set dependencies (pool and JWT secret)
let pool;
let JWT_SECRET;

function setAuthDependencies(dbPool, jwtSecret) {
  pool = dbPool;
  JWT_SECRET = jwtSecret;
  if (!pool) {
    console.error('Auth routes: Database pool not set!');
  }
  if (!JWT_SECRET) {
    console.error('Auth routes: JWT_SECRET not set!');
  }
}

// Register Route
router.post('/register', async (req, res) => {
  if (!pool || !JWT_SECRET) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const userExists = await pool.query(
      'SELECT * FROM students WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStudent = await pool.query(
      'INSERT INTO students (email, password_hash) VALUES ($1, $2) RETURNING student_id, email, is_first_login',
      [ email, hashedPassword]
    );

    // Create a corresponding profile entry
    await pool.query(
      'INSERT INTO student_profiles (student_id) VALUES ($1) RETURNING profile_id',
      [newStudent.rows[0].student_id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { student_id: newStudent.rows[0].student_id, role: 'student' }, // Assuming default role is student
      JWT_SECRET,
      { expiresIn: '1h' } // Consider making expiry configurable
    );

    res.status(201).json({
      token,
      student: {
        student_id: newStudent.rows[0].student_id,
        email: newStudent.rows[0].email,
        is_first_login: newStudent.rows[0].is_first_login,
        role: 'student' // Explicitly return role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      message: 'Server error during registration',
      error: err.message,
      detail: err.detail // Include detail for debugging if available
    });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  if (!pool || !JWT_SECRET) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check both students and teachers tables
    let user = null;
    let userType = null;

    // Check students table
    const studentResult = await pool.query(
      'SELECT student_id AS id, email, password_hash, role, is_first_login FROM students WHERE email = $1',
      [email.toLowerCase()]
    );

    if (studentResult.rows.length > 0) {
        user = studentResult.rows[0];
        userType = 'student';
    } else {
        // Check teachers table if not found in students
        const teacherResult = await pool.query(
            'SELECT teacher_id AS id, email, password_hash, role FROM teachers WHERE email = $1',
            [email.toLowerCase()]
        );
        if (teacherResult.rows.length > 0) {
            user = teacherResult.rows[0];
            userType = 'teacher';
        }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role // Use the role from the database
      },
      JWT_SECRET,
      { expiresIn: '24h' } // Consider making expiry configurable
    );

    // Prepare user object for response (exclude password hash)
    const userResponse = {
        id: user.id,
        email: user.email,
        role: user.role,
    };
    if (userType === 'student') {
        userResponse.is_first_login = user.is_first_login;
    }


    res.json({
      token,
      user: userResponse
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = { router, setAuthDependencies };
