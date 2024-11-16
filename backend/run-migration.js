const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'str_book',
    password: 'pg',
    port: 5432,
});

async function runMigration() {
    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'migrations', 'update_student_profile.sql');
        const sqlContent = await fs.readFile(sqlPath, 'utf8');

        // Execute the SQL
        await pool.query(sqlContent);
        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
