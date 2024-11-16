const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { 
  saveFileMetadata, 
  getUserFiles, 
  deleteFileMetadata 
} = require('../controllers/fileController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.params.type === 'profile' ? 'profiles' : 'certificates';
    const uploadPath = path.join(__dirname, '..', 'uploads', type);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const type = req.params.type;
    if (type === 'profile') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only images are allowed for profile pictures'));
      }
    } else if (type === 'certificate') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed for certificates'));
      }
    }
    cb(null, true);
  }
});

// Upload file route
router.post('/:type/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { type } = req.params;
    const { semester } = req.body;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // For development, construct local URL
    const fileUrl = process.env.NODE_ENV === 'development'
      ? `/api/files/${type}/${file.filename}`
      : file.path; // In production usethe Firebase URL

    const fileType = type === 'profile' ? 'profile_picture' : 'mooc_certificate';
    
    const savedFile = await saveFileMetadata(
      userId,
      fileType,
      semester || null,
      file.filename,
      file.originalname,
      fileUrl,
      file.size,
      file.mimetype
    );

    res.json({
      message: 'File uploaded successfully',
      file: savedFile
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading file',
      error: error.message 
    });
  }
});

// Get user's files
router.get('/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { semester } = req.query;
    const userId = req.user.id;
    
    const fileType = type === 'profile' ? 'profile_picture' : 'mooc_certificate';
    const files = await getUserFiles(userId, fileType, semester);
    
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ 
      message: 'Error fetching files',
      error: error.message 
    });
  }
});

// Delete file
router.delete('/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { semester } = req.body;
    const userId = req.user.id;
    
    const fileType = type === 'profile' ? 'profile_picture' : 'mooc_certificate';
    const deletedFile = await deleteFileMetadata(userId, fileType, semester);
    
    if (deletedFile) {
      // In development delete the file
      if (process.env.NODE_ENV === 'development') {
        const filePath = path.join(__dirname, '..', deletedFile.file_url);
        await fs.unlink(filePath).catch(console.error);
      }
      // In production delete from Firebase
      
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      message: 'Error deleting file',
      error: error.message 
    });
  }
});

module.exports = router;
