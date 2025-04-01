require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
// Removed unused imports: const bcrypt = require('bcrypt');
// Removed unused imports: const jwt = require('jsonwebtoken');
const moocCertificatesRouter = require('./routes/moocCertificates');
const { router: studentProfileRouter, setPool: setStudentProfilePool } = require('./routes/studentProfile');
const { router: projectsRouter, setPool: setProjectsPool } = require('./routes/projects');
const { router: teacherRouter, setPool: setTeacherPool } = require('./routes/teacher');
const { router: authRouter, setAuthDependencies } = require('./routes/auth'); // Import the new auth router


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
setAuthDependencies(pool, JWT_SECRET); // Pass dependencies to the auth router


app.get('/', (req, res) => {
  res.send('Server is up and running');
});

// Removed redundant and problematic /api/students route handler.
// Registration should be handled via /api/auth/register.
// Profile updates should be handled via /api/student-profile routes.

// Mount the authentication routes
app.use('/api/auth', authRouter); // Use the new auth router

// Mount other routes
app.use('/api/student-profile', studentProfileRouter);
app.use('/api/mooc-certificates', moocCertificatesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/teacher', teacherRouter);
// Removed the old inline /api/register and /api/login routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
