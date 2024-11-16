const { pool } = require('../db');
const path = require('path');
const fs = require('fs').promises;

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure upload dir exist
async function ensureUploadDirs() {
  const dirs = ['profiles', 'certificates'].map(dir => path.join(UPLOAD_DIR, dir));
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Initialize upload dir
ensureUploadDirs().catch(console.error);

// Save file metadata to db
async function saveFileMetadata(userId, fileType, semester, fileName, originalName, fileUrl, fileSize, mimeType) {
  const query = `
    INSERT INTO user_files 
    (user_id, file_type, semester, file_name, original_name, file_url, file_size, mime_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (user_id, file_type, semester) 
    WHERE file_type = $2 
    DO UPDATE SET
      file_name = EXCLUDED.file_name,
      original_name = EXCLUDED.original_name,
      file_url = EXCLUDED.file_url,
      file_size = EXCLUDED.file_size,
      mime_type = EXCLUDED.mime_type,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  const values = [userId, fileType, semester, fileName, originalName, fileUrl, fileSize, mimeType];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Get user's files
async function getUserFiles(userId, fileType, semester = null) {
  const query = `
    SELECT * FROM user_files 
    WHERE user_id = $1 
    AND file_type = $2
    ${semester ? 'AND semester = $3' : ''}
    ORDER BY uploaded_at DESC
  `;

  const values = semester ? [userId, fileType, semester] : [userId, fileType];
  const result = await pool.query(query, values);
  return result.rows;
}

// Delete file metadata
async function deleteFileMetadata(userId, fileType, semester = null) {
  const query = `
    DELETE FROM user_files 
    WHERE user_id = $1 
    AND file_type = $2
    ${semester ? 'AND semester = $3' : ''}
    RETURNING *
  `;

  const values = semester ? [userId, fileType, semester] : [userId, fileType];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Dev
function setupDevFileServing(app) {
  if (process.env.NODE_ENV === 'development') {
    app.use('/api/files', express.static(UPLOAD_DIR));
  }
}

module.exports = {
  saveFileMetadata,
  getUserFiles,
  deleteFileMetadata,
  setupDevFileServing
};
