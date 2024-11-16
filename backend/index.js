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
  user: 'postgres',       //  PostgreSQL username
  host: 'localhost',      // Hostname
  database: 'str_book',   //  database name
  password: 'pg',         //  PostgreSQL password
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
      // Check if it's a teacher
      const teacher = await pool.query('SELECT * FROM teacher_profile WHERE email = $1', [email]);
      if (teacher.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      const isMatch = await bcrypt.compare(password, teacher.rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: teacher.rows[0].id, email: teacher.rows[0].email, type: 'teacher' },
        'jwt_secret',
        { expiresIn: '1h' }
      );

      return res.json({ token, userType: 'teacher', isProfileComplete: true });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if student profile is complete
    const isProfileComplete = user.rows[0].name && 
                            user.rows[0].usn && 
                            user.rows[0].gender && 
                            user.rows[0].nationality && 
                            user.rows[0].phone;

    // Generate JWT
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email, type: 'student' },
      'jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ token, userType: 'student', isProfileComplete });
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

// Get student profile
app.get('/api/student/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT name, usn, email, gender, nationality, phone, dob, religion, hobbies, profile_picture_url FROM student_profile WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const profile = result.rows[0];
    res.json({
      personalInfo: {
        name: profile.name || '',
        usn: profile.usn || '',
        gender: profile.gender || '',
        nationality: profile.nationality || '',
        phone: profile.phone || '',
        email: profile.email || '',
        dob: profile.dob || '',
        religion: profile.religion || '',
        hobbies: profile.hobbies || '',
        profilePicture: profile.profile_picture_url || null
      }
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// Update student profile
app.post('/api/student/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { personalInfo } = req.body;

    console.log('Received profile update request:', {
      userId,
      personalInfo
    });

    // Validate required fields
    const required = ['name', 'usn', 'gender', 'nationality', 'phone', 'religion'];
    const missing = required.filter(field => !personalInfo[field]);
    
    if (missing.length > 0) {
      console.log('Missing required fields:', missing);
      return res.status(400).json({ 
        message: `Missing required fields: ${missing.join(', ')}` 
      });
    }

    // Check if the email exists (if provided)
    if (personalInfo.email) {
      const emailCheck = await pool.query(
        'SELECT id FROM student_profile WHERE email = $1 AND id != $2',
        [personalInfo.email, userId]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Check if the USN exists
    const usnCheck = await pool.query(
      'SELECT id FROM student_profile WHERE usn = $1 AND id != $2',
      [personalInfo.usn, userId]
    );
    if (usnCheck.rows.length > 0) {
      return res.status(400).json({ message: 'USN already exists' });
    }

    // First, check if the profile exists
    const existingProfile = await pool.query(
      'SELECT id FROM student_profile WHERE id = $1',
      [userId]
    );

    let result;
    const values = [
      personalInfo.name,
      personalInfo.usn,
      personalInfo.gender,
      personalInfo.nationality,
      personalInfo.phone,
      personalInfo.email || null,
      personalInfo.dob || null,
      personalInfo.religion,
      personalInfo.hobbies || null,
      personalInfo.profilePicture || null
    ];

    if (existingProfile.rows.length === 0) {
      // Insert new profile
      const insertQuery = `
        INSERT INTO student_profile 
        (id, name, usn, gender, nationality, phone, email, dob, religion, hobbies, profile_picture_url, created_at, updated_at)
        VALUES ($11, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      values.push(userId);
      result = await pool.query(insertQuery, values);
      console.log('Inserted new profile');
    } else {
      // Update existing profile
      const updateQuery = `
        UPDATE student_profile 
        SET name = $1, usn = $2, gender = $3, nationality = $4, 
            phone = $5, email = $6, dob = $7, religion = $8,
            hobbies = $9, profile_picture_url = $10,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `;
      values.push(userId);
      result = await pool.query(updateQuery, values);
      console.log('Updated existing profile');
    }

    if (result.rows.length === 0) {
      console.error('No rows returned after profile update');
      return res.status(500).json({ message: 'Failed to update profile' });
    }

    console.log('Profile updated successfully');
    res.json({ 
      message: 'Profile updated successfully',
      isProfileComplete: true
    });
  } catch (err) {
    console.error('Profile update error:', err);
    if (err.constraint === 'student_profile_usn_key') {
      return res.status(400).json({ message: 'USN already exists' });
    }
    if (err.constraint === 'student_profile_email_key') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ 
      message: 'Server error while updating profile',
      error: err.message 
    });
  }
});

const fileRoutes = require('./routes/fileRoutes');
const { setupDevFileServing } = require('./controllers/fileController');

// Set up file serving for development
setupDevFileServing(app);

// Add file routes
app.use('/api/files', fileRoutes);

// Example protected route
app.get('/api/student-profile', authenticateToken, (req, res) => {
  //logic to get student profile
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});