# STRbook - Student Transformation Record book

A web application designed to replace the traditional physical student record book.

## Key Features

- **Student Portal:** Secure login, profile management, MOOC certificate uploads, academic/extracurricular tracking.
- **Teacher Dashboard:** View student profiles, evaluate certificates, provide feedback.
- **Admin Capabilities:** Manage users and system settings.

## Technologies Used

- **Frontend:**
  - React.js
  - Material-UI (@mui/material)
  - React Router (`react-router-dom`)
  - Axios (for API requests)
  - Firebase (for Authentication/Storage)
- **Backend:**
  - Node.js
  - Express.js
  - PostgreSQL (`pg`)
  - JWT (`jsonwebtoken` for Authentication)
  - bcrypt (for Password Hashing)
  - CORS, Body Parser (Middleware)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL (v12 or later)
- Git

## Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/sajalkmr/strbook.git
   cd strbook
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory with your specific credentials (see example below).

3. **Install Dependencies**
   ```bash
   # Install frontend dependencies (in root directory)
   npm install

   # Install backend dependencies
   cd backend
   npm install
   cd .. # Return to root directory
   ```

4. **Database Setup**
   Ensure your PostgreSQL server is running.
   ```bash
   # Connect to PostgreSQL (replace 'postgres' if using a different user)
   psql -U postgres

   # Create the database
   CREATE DATABASE str_book;
   \q

   # Run migrations (from backend directory)
   cd backend
   node migrations/run-migrations.js
   cd .. # Return to root directory
   ```

5. **Start Development Servers**
   ```bash
   # Start backend and frontend concurrently from the root directory
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

**Example `.env` file (root directory):**

```env
# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
# ... add other Firebase config variables as needed (projectId, storageBucket, etc.)

# Backend Environment Variables
PORT=5000
DB_USER=your_db_user # e.g., postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=str_book
JWT_SECRET=your_very_secret_and_strong_jwt_key
```

---
*Note: Remember to replace placeholder values in `.env` with your actual configuration.*
