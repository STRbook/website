const express = require('express');
const authenticateToken = require('../middleware/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

let pool; // Database pool instance will be injected
const setPool = (dbPool) => {
  pool = dbPool;
};

// GET /api/teacher/students - Fetch list of students for teacher view
router.get('/students', authenticateToken, async (req, res) => {
  // Authorization check: Ensure user is a teacher
  if (req.user.role !== 'teacher') { 
    return res.status(403).json({ message: 'Forbidden: Access restricted to teachers' });
  }

  if (!pool) return res.status(500).send('Database pool not configured');
  const client = await pool.connect();

  try {
    // Fetch basic student info (ID, name, USN). Join with profiles if names are there.
    // Adjust query based on where first/last names are stored (students or student_profiles)
    const studentListResult = await client.query(
      `SELECT 
         s.student_id, 
         s.email, 
         COALESCE(sp.first_name, '') as first_name, 
         COALESCE(sp.last_name, '') as last_name, 
         COALESCE(sp.usn, '') as usn
       FROM students s
       LEFT JOIN student_profiles sp ON s.student_id = sp.student_id
       ORDER BY sp.last_name, sp.first_name, s.student_id` // Example ordering
    );

    res.json(studentListResult.rows);

  } catch (err) {
    console.error('Error fetching student list for teacher:', err);
    res.status(500).json({ 
      message: 'Failed to fetch student list',
      error: err.message 
    });
  } finally {
    client.release();
  }
});

// POST /api/teacher/login - Teacher Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!pool) return res.status(500).send('Database pool not configured');
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM teachers WHERE email = $1',
      [email.toLowerCase()] // Ensure consistent email checking
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const teacher = result.rows[0];

    const validPassword = await bcrypt.compare(password, teacher.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: teacher.teacher_id, // Use teacher_id
        email: teacher.email,
        role: teacher.role // Include the role from the database
      },
      process.env.JWT_SECRET || 'your-secret-key', // Use the same secret as student login for now
      { expiresIn: '24h' } // Token expiration time
    );

    res.json({
      token,
      user: { // Return user info consistent with student login response
        id: teacher.teacher_id,
        email: teacher.email,
        role: teacher.role,
        // Add first/last name if needed in the frontend immediately after login
        first_name: teacher.first_name, 
        last_name: teacher.last_name
      }
    });

  } catch (err) {
    console.error('Teacher login error:', err);
    res.status(500).json({ message: 'Server error during teacher login' });
  } finally {
    client.release();
  }
});

// POST /api/teacher/register - Teacher Registration
router.post('/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!pool) return res.status(500).send('Database pool not configured');
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'Email, password, first name, and last name are required' });
  }

  const client = await pool.connect();
  try {
    // Check if teacher already exists
    const userExists = await client.query(
      'SELECT * FROM teachers WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new teacher (role defaults to 'teacher' based on table schema)
    const newTeacher = await client.query(
      `INSERT INTO teachers (email, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING teacher_id, email, first_name, last_name, role`,
      [email.toLowerCase(), hashedPassword, first_name, last_name]
    );

    res.status(201).json({
      message: 'Teacher registered successfully',
      teacher: newTeacher.rows[0] // Return newly created teacher info (excluding hash)
    });

  } catch (err) {
    console.error('Teacher registration error:', err);
    res.status(500).json({ 
      message: 'Server error during teacher registration',
      error: err.message 
    });
  } finally {
    client.release();
  }
});


// Add other teacher-specific routes here later (e.g., view specific profile, etc.)

module.exports = { router, setPool };
