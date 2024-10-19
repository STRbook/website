# STRbook - Student Transformation Record book

Web app to replace physical str book.

## Features

- User authentication (Login/Register)
- Student Dashboard
  - Add MOOC certificates
  - View previous MOOC certificates
- Teacher Dashboard
  - View students' MOOC certificates
  - Score certificates
- Student Profile
  - View and manage personal information

## Technologies Used

- Frontend: React.js
- Backend: Node.js with Express.js
- Database: PostgreSQL
- Authentication: JSON Web Tokens (JWT)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/strbook.git
   cd strbook
   ```

2. Install dependencies for both frontend and backend:
   ```
   npm install
   cd backend
   npm install
   ```

3. Set up the database:
   - Create a PostgreSQL database named `str_book`
   - Update the database connection details in `backend/index.js`:

   ```javascript
   const pool = new Pool({
     user: 'postgres',       // Your PostgreSQL username
     host: 'localhost',      // Hostname
     database: 'str_book',   // Your database name
     password: 'pg',         // Your PostgreSQL password
     port: 5432,             // PostgreSQL port
   });
   ```

4. Start the backend server:
   ```
   cd backend
   node index.js
   ```

5. Start the frontend development server:
   ```
   cd ..
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

### Student

1. Register a new account or log in
2. Navigate to the dashboard to add new MOOC certificates
3. View your profile and previous certificates

### Teacher

1. Log in with teacher credentials
2. Select a class to view students' MOOC certificates
3. Review and score the certificates

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License



## Acknowledgements

- [Create React App](https://github.com/facebook/create-react-app)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [JSON Web Tokens](https://jwt.io/)
