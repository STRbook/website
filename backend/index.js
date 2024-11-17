const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

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

// Student Registration endpoint
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if email already exists
    const userExists = await pool.query(
      'SELECT * FROM students WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate username from email
    

    console.log('Attempting to create new student with:', {
      
      email,
      hashedPassword: 'HIDDEN'
    });

    // Insert new student
    const newStudent = await pool.query(
      'INSERT INTO students (email, password_hash) VALUES ($1, $2) RETURNING student_id, email, is_first_login',
      [ email, hashedPassword]
    );

    console.log('Student created:', newStudent.rows[0]);

    // Create empty profile
    const profile = await pool.query(
      'INSERT INTO student_profiles (student_id) VALUES ($1) RETURNING profile_id',
      [newStudent.rows[0].student_id]
    );

    console.log('Profile created:', profile.rows[0]);

    // Generate JWT token
    const token = jwt.sign(
      { student_id: newStudent.rows[0].student_id },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      student: {
        student_id: newStudent.rows[0].student_id,
        email: newStudent.rows[0].email,
        is_first_login: newStudent.rows[0].is_first_login
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: err.message,
      detail: err.detail
    });
  }
});

// Student Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Login request received for email:', email);

  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log('Querying database for student with email:', email);

    // Check if student exists
    const student = await pool.query(
      'SELECT student_id, email, password_hash, is_first_login FROM students WHERE email = $1',
      [email]
    );

    console.log('Database query result:', { 
      found: student.rows.length > 0,
      studentId: student.rows[0]?.student_id
    });

    if (student.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, student.rows[0].password_hash);
    console.log('Password verification result:', validPassword);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await pool.query(
      'UPDATE students SET last_login = CURRENT_TIMESTAMP WHERE student_id = $1',
      [student.rows[0].student_id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { student_id: student.rows[0].student_id },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );

    console.log('Login successful, sending response');

    res.json({
      token,
      student: {
        student_id: student.rows[0].student_id,
        email: student.rows[0].email,
        is_first_login: student.rows[0].is_first_login
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Server error during login',
      error: err.message,
      detail: err.detail || 'No additional details'
    });
  }
});

// Get student profile
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await pool.query(
      `SELECT p.*, pi.*, 
              array_agg(DISTINCT a.*) as addresses,
              array_agg(DISTINCT ar.*) as academic_records,
              array_agg(DISTINCT si.*) as siblings,
              array_agg(DISTINCT h.hobby_name) as hobbies
       FROM student_profiles p
       LEFT JOIN parent_info pi ON p.profile_id = pi.student_profile_id
       LEFT JOIN addresses a ON p.profile_id = a.student_profile_id
       LEFT JOIN academic_records ar ON p.profile_id = ar.student_profile_id
       LEFT JOIN sibling_info si ON p.profile_id = si.student_profile_id
       LEFT JOIN hobbies h ON p.profile_id = h.student_profile_id
       WHERE p.student_id = $1
       GROUP BY p.profile_id, pi.parent_id`,
      [req.query.student_id]
    );

    if (profile.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Student Profile Endpoint
app.post('/api/student-profile', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      studentId,
      first_name, last_name, usn, dob, phone,
      father_name, mother_name, parent_contact, parent_email,
      permanent_address, temporary_address,
      academic_records, siblings, hobbies 
    } = req.body;

    // Insert student profile
    const profileResult = await client.query(
      `INSERT INTO student_profiles 
       (student_id, first_name, last_name, usn, dob, phone, profile_completed)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING profile_id`,
      [studentId, first_name, last_name, usn, dob, phone]
    );
    
    const profileId = profileResult.rows[0].profile_id;

    // Insert parent information
    await client.query(
      `INSERT INTO parent_info 
       (student_profile_id, father_name, mother_name, contact, email)
       VALUES ($1, $2, $3, $4, $5)`,
      [profileId, father_name, mother_name, parent_contact, parent_email]
    );

    // Insert addresses
    await client.query(
      `INSERT INTO addresses 
       (student_profile_id, address_type, street, city, state, zip_code, country)
       VALUES ($1, 'permanent', $2, $3, $4, $5, $6)`,
      [
        profileId,
        permanent_address.street,
        permanent_address.city,
        permanent_address.state,
        permanent_address.zip_code,
        permanent_address.country
      ]
    );

    await client.query(
      `INSERT INTO addresses 
       (student_profile_id, address_type, street, city, state, zip_code, country)
       VALUES ($1, 'temporary', $2, $3, $4, $5, $6)`,
      [
        profileId,
        temporary_address.street,
        temporary_address.city,
        temporary_address.state,
        temporary_address.zip_code,
        temporary_address.country
      ]
    );

    // Insert academic records
    for (const record of academic_records) {
      if (record.gpa) {  // Only insert if GPA is provided
        await client.query(
          `INSERT INTO academic_records 
           (student_profile_id, semester, gpa)
           VALUES ($1, $2, $3)`,
          [profileId, record.semester, record.gpa]
        );
      }
    }

    // Insert siblings
    for (const sibling of siblings) {
      if (sibling.sibling_name && sibling.relationship) {  // Only insert if both fields are provided
        await client.query(
          `INSERT INTO sibling_info 
           (student_profile_id, sibling_name, relationship)
           VALUES ($1, $2, $3)`,
          [profileId, sibling.sibling_name, sibling.relationship]
        );
      }
    }

    // Insert hobbies
    for (const hobby of hobbies) {
      if (hobby) {  // Only insert non-empty hobbies
        await client.query(
          `INSERT INTO hobbies 
           (student_profile_id, hobby_name)
           VALUES ($1, $2)`,
          [profileId, hobby]
        );
      }
    }

    // Update is_first_login in students table
    await client.query(
      `UPDATE students 
       SET is_first_login = false 
       WHERE student_id = $1`,
      [studentId]
    );

    await client.query('COMMIT');
    
    res.json({ 
      message: 'Profile created successfully',
      profileId 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating profile:', err);
    res.status(500).json({ 
      message: 'Failed to create profile',
      error: err.message 
    });
  } finally {
    client.release();
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
  console.log(`Server is running on port ${PORT}`);
});