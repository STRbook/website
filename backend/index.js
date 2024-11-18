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

  try {
    // Check if user exists
    const result = await pool.query('SELECT * FROM students WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const student = result.rows[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, student.password_hash);
    
    if (!validPassword) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token with student_id
    const token = jwt.sign(
      { 
        student_id: student.student_id,
        email: student.email 
      }, 
      'your_jwt_secret',
      { expiresIn: '24h' }
    );

    console.log('Login successful, sending response with token');
    
    // Update last login
    await pool.query(
      'UPDATE students SET last_login = CURRENT_TIMESTAMP WHERE student_id = $1',
      [student.student_id]
    );

    // Send response
    res.json({
      token,
      student: {
        student_id: student.student_id,
        email: student.email,
        is_first_login: student.is_first_login
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
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
app.post('/api/student-profile', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      studentId,
      first_name, last_name, usn, dob, phone,
      father_name, mother_name, parent_contact, parent_email,
      permanent_address, temporary_address,
      academic_records, siblings, hobbies,
      profile_picture_url
    } = req.body;

    // Verify the authenticated user matches the studentId
    if (req.user.student_id !== studentId) {
      throw new Error('Unauthorized: User ID mismatch');
    }

    // Check if profile already exists
    const existingProfile = await client.query(
      'SELECT profile_id FROM student_profiles WHERE student_id = $1',
      [studentId]
    );

    if (existingProfile.rows.length > 0) {
      // Update existing profile
      const profileId = existingProfile.rows[0].profile_id;
      
      await client.query(
        `UPDATE student_profiles 
         SET first_name = $1, last_name = $2, usn = $3, dob = $4, phone = $5, 
             profile_completed = true, profile_picture_url = $6
         WHERE profile_id = $7`,
        [first_name, last_name, usn, dob, phone, profile_picture_url, profileId]
      );

      // Update parent info
      await client.query(
        `UPDATE parent_info 
         SET father_name = $1, mother_name = $2, contact = $3, email = $4
         WHERE student_profile_id = $5`,
        [father_name, mother_name, parent_contact, parent_email, profileId]
      );

      // Delete existing addresses
      await client.query(
        'DELETE FROM addresses WHERE student_profile_id = $1',
        [profileId]
      );

      // Insert new addresses
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

      // Delete existing academic records
      await client.query(
        'DELETE FROM academic_records WHERE student_profile_id = $1',
        [profileId]
      );

      // Insert new academic records
      for (const record of academic_records) {
        await client.query(
          `INSERT INTO academic_records 
           (student_profile_id, degree, institution, year, grade)
           VALUES ($1, $2, $3, $4, $5)`,
          [profileId, record.degree, record.institution, record.year, record.grade]
        );
      }

      // Delete existing siblings
      await client.query(
        'DELETE FROM sibling_info WHERE student_profile_id = $1',
        [profileId]
      );

      // Insert new siblings
      for (const sibling of siblings) {
        if (sibling.sibling_name && sibling.relationship) {
          await client.query(
            `INSERT INTO sibling_info 
             (student_profile_id, sibling_name, relationship)
             VALUES ($1, $2, $3)`,
            [profileId, sibling.sibling_name, sibling.relationship]
          );
        }
      }

      // Delete existing hobbies
      await client.query(
        'DELETE FROM hobbies WHERE student_profile_id = $1',
        [profileId]
      );

      // Insert new hobbies
      for (const hobby of hobbies) {
        await client.query(
          `INSERT INTO hobbies 
           (student_profile_id, hobby_name)
           VALUES ($1, $2)`,
          [profileId, hobby.hobby_name]
        );
      }

      await client.query('COMMIT');
      
      res.json({ 
        message: 'Profile updated successfully',
        profileId 
      });
    } else {
      // Insert new profile
      const profileResult = await client.query(
        `INSERT INTO student_profiles 
         (student_id, first_name, last_name, usn, dob, phone, profile_completed, profile_picture_url)
         VALUES ($1, $2, $3, $4, $5, $6, true, $7)
         RETURNING profile_id`,
        [studentId, first_name, last_name, usn, dob, phone, profile_picture_url]
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
        await client.query(
          `INSERT INTO academic_records 
           (student_profile_id, degree, institution, year, grade)
           VALUES ($1, $2, $3, $4, $5)`,
          [profileId, record.degree, record.institution, record.year, record.grade]
        );
      }

      // Insert siblings
      for (const sibling of siblings) {
        if (sibling.sibling_name && sibling.relationship) {
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
        await client.query(
          `INSERT INTO hobbies 
           (student_profile_id, hobby_name)
           VALUES ($1, $2)`,
          [profileId, hobby.hobby_name]
        );
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
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating/updating profile:', err);
    res.status(err.message === 'Unauthorized: User ID mismatch' ? 403 : 500).json({ 
      message: 'Failed to create/update profile',
      error: err.message 
    });
  } finally {
    client.release();
  }
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  console.log('Auth headers:', req.headers['authorization']);
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  
  if (!token) {
    console.log('No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      console.log('Token verification failed:', err);
      return res.sendStatus(403);
    }
    console.log('Token verified for user:', user);
    req.user = user;
    next();
  });
};

// Get Student Profile
app.get('/api/student-profile/:studentId', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { studentId } = req.params;
    console.log('Fetching profile for student:', studentId);

    // First check if student exists
    const studentResult = await client.query(
      'SELECT student_id, email, is_first_login FROM students WHERE student_id = $1',
      [studentId]
    );
    console.log('Student query result:', studentResult.rows);

    if (studentResult.rows.length === 0) {
      console.log('Student not found');
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student profile - get the latest profile based on profile_id
    const profileResult = await client.query(
      `SELECT sp.*, s.email 
       FROM student_profiles sp
       JOIN students s ON s.student_id = sp.student_id
       WHERE sp.student_id = $1
       ORDER BY sp.profile_id DESC
       LIMIT 1`,
      [studentId]
    );
    console.log('Profile query result:', profileResult.rows);

    if (profileResult.rows.length === 0) {
      console.log('No profile found, returning basic info');
      return res.json({
        ...studentResult.rows[0],
        profile_completed: false
      });
    }

    const profile = profileResult.rows[0];
    const profileId = profile.profile_id;

    // Get all related data in parallel for better performance
    const [parentResult, addressesResult, academicResult, siblingsResult, hobbiesResult] = await Promise.all([
      // Get parent info
      client.query(
        'SELECT * FROM parent_info WHERE student_profile_id = $1',
        [profileId]
      ),
      // Get addresses
      client.query(
        'SELECT * FROM addresses WHERE student_profile_id = $1',
        [profileId]
      ),
      // Get academic records
      client.query(
        'SELECT * FROM academic_records WHERE student_profile_id = $1 ORDER BY year DESC',
        [profileId]
      ),
      // Get siblings
      client.query(
        'SELECT * FROM sibling_info WHERE student_profile_id = $1',
        [profileId]
      ),
      // Get hobbies
      client.query(
        'SELECT * FROM hobbies WHERE student_profile_id = $1',
        [profileId]
      )
    ]);

    // Construct the complete profile object
    const studentProfile = {
      student_id: profile.student_id,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      usn: profile.usn,
      dob: profile.dob,
      phone: profile.phone,
      profile_completed: profile.profile_completed,
      parent_info: parentResult.rows[0] || null,
      addresses: addressesResult.rows || [],
      academic_records: academicResult.rows || [],
      siblings: siblingsResult.rows || [],
      hobbies: hobbiesResult.rows || []
    };

    res.json(studentProfile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ 
      message: 'Failed to fetch profile',
      error: err.message 
    });
  } finally {
    client.release();
  }
});

// Example protected route
app.get('/api/student-profile', authenticateToken, (req, res) => {
  //logic to get student profile
});

// Get Student Profile
app.get('/api/student-profile/:studentId', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    // Get basic profile info
    const profileResult = await client.query(
      `SELECT * FROM student_profiles WHERE student_id = $1`,
      [req.params.studentId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const profile = profileResult.rows[0];
    const profileId = profile.profile_id;

    // Get academic records
    const academicRecords = await client.query(
      `SELECT degree, institution, year, grade 
       FROM academic_records 
       WHERE student_profile_id = $1 
       ORDER BY year DESC`,
      [profileId]
    );

    // Get hobbies
    const hobbies = await client.query(
      `SELECT hobby_name 
       FROM hobbies 
       WHERE student_profile_id = $1`,
      [profileId]
    );

    // Combine all data
    const fullProfile = {
      ...profile,
      academic_records: academicRecords.rows,
      hobbies: hobbies.rows
    };

    res.json(fullProfile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});