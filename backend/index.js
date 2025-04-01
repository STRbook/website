require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moocCertificatesRouter = require('./routes/moocCertificates');
const { router: studentProfileRouter, setPool: setStudentProfilePool } = require('./routes/studentProfile'); 
const { router: projectsRouter, setPool: setProjectsPool } = require('./routes/projects'); 
const { router: teacherRouter, setPool: setTeacherPool } = require('./routes/teacher'); 


const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
console.log('JWT_SECRET loaded:', JWT_SECRET ? 'Yes' : 'No');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'str_book',
  password: process.env.DB_PASSWORD || 'pg',
  port: parseInt(process.env.DB_PORT || '5432'),
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to database at:', res.rows[0].now);
  }
});


setStudentProfilePool(pool);
setProjectsPool(pool); 
setTeacherPool(pool); 


app.get('/', (req, res) => {
  res.send('Server is up and running');
});

app.post('/api/students', async (req, res) => {
  const { name, usn, email, gender, nationality, religion, caste, dob, phone, hobbies, profile_picture_url, password } = req.body;

  try {
    const newStudent = await pool.query(
      'INSERT INTO student_profile (name, usn, email, gender, nationality, religion, caste, dob, phone, hobbies, profile_picture_url, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [name, usn, email, gender, nationality, religion, caste, dob, phone, hobbies, profile_picture_url, password]
    );
    res.json(newStudent.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/api/register', async (req, res) => {
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

    await pool.query(
      'INSERT INTO student_profiles (student_id) VALUES ($1) RETURNING profile_id',
      [newStudent.rows[0].student_id]
    );

    const token = jwt.sign(
      { student_id: newStudent.rows[0].student_id },
      JWT_SECRET,
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

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM students WHERE email = $1', 
      [email.toLowerCase()] 
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const student = result.rows[0];
    
    const validPassword = await bcrypt.compare(password, student.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userRole = student.role || 'student'; 
    
    const token = jwt.sign(
      { 
        id: student.student_id, 
        email: student.email,
        role: userRole 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { 
        id: student.student_id,
        email: student.email,
        role: userRole, 
        is_first_login: student.is_first_login
        
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});


app.use('/api/student-profile', studentProfileRouter);
app.use('/api/mooc-certificates', moocCertificatesRouter);
app.use('/api/projects', projectsRouter); 
app.use('/api/teacher', teacherRouter); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
