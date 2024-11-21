# STRbook - Student Transformation Record book

Web app to replace physical str book.

## Key Features

### For Students
- **Authentication & Profile Management**
  - Secure login/registration system
  - Comprehensive profile management
  
- **MOOC Certificate Management**
  - Upload and store MOOC certificates
  - Track certification progress
  - View certification history

- **Academic Portfolio**
  - Track academic achievements
  - Manage hobbies and extracurricular activities
  - Progress visualization

### For Teachers
- **Student Management**
  - View student profiles and progress
  - Evaluate MOOC certificates
  - Provide feedback and scoring


## Technologies Used

- **Frontend**
  - React.js
  - Material-UI
  - Firebase Integration
  
- **Backend**
  - Node.js
  - Express.js
  - PostgreSQL
  - JWT Authentication

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
   Create a `.env` file in the root directory:
   ```env
   # Frontend Environment Variables
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   
   # Backend Environment Variables
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=str_book
   JWT_SECRET=your_jwt_secret
   ```

3. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   psql -U postgres
   CREATE DATABASE str_book;
   
   # Run migrations
   cd backend
   node migrations/run-migrations.js
   ```

5. **Start Development Servers**
   ```bash
   # Option 1: Start servers separately
   # Start backend server (from backend directory)
   npm run backend
   
   # Start frontend development server (from root directory)
   npm start
   
   # Option 2: Start both servers concurrently
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
