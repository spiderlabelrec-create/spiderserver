const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Allow images for album cover and audio files for track
  if (file.fieldname === 'albumCapa') {
    // Check for image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for album cover!'), false);
    }
  } else if (file.fieldname === 'audioFile') {
    // Check for audio files
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav') {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 and WAV files are allowed for audio!'), false);
    }
  } else {
    cb(new Error('Invalid field!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit per file
  }
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key', // Change this in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory user store (for demo). In production, use a database.
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$gUhXYJfZC3e9tn/4G4qcxOYkMEGTYAgSHkWajixUcyQqJnlNNz8RW', // hashed 'password' (bcrypt hash of 'password')
    role: 'admin'
  },
  {
    id: 2,
    username: 'RTKnalha',
    password: '$2a$10$87EL.9eA/yGn6LHVhsmOs.HhSjurZjkNe.eOHVLTE/eAM0v37ZDqC', // hashed 'RTKnalha'
    role: 'artist'
  },
  {
    id: 3,
    username: 'HiruTheKid',
    password: '$2a$10$Du/3eleTWHr9TwhwhHz1m.ClOMhKH3S5tqp8Q67/Zux8B1E6WRHW2', // hashed 'HiruTheKid'
    role: 'artist'
  },
  {
    id: 4,
    username: 'Mazziero',
    password: '$2a$10$mkUmjHvuqf46J94LEX6d0u1Uv5XVocF7Yt1MWdTcxaUBFqS4HdfK2', // hashed 'Mazziero'
    role: 'artist'
  },
  {
    id: 5,
    username: 'Ouhgee',
    password: '$2a$10$iQcUm3i2mRJ1ZE8/y3VevunfNBzdk4mvLS.dklLy6/hL.Pvx8OVY2', // hashed 'Ouhgee'
    role: 'artist'
  },
  {
    id: 6,
    username: 'Damasio.8',
    password: '$2a$10$OiihQUFGpR28aC84Slwu8.xnlnMqevWl/9Q6yE1SWIQzyHdSY9CZm', // hashed 'Damasio.8'
    role: 'artist'
  },
  {
    id: 7,
    username: 'Sappy Blush',
    password: '$2a$10$E0YuNKvFvPzVwvbadSaDV.T6cpCasnytr1c82Y6MGyUnmIf1dpHmy', // hashed 'Sappy Blush'
    role: 'artist'
  },
  {
    id: 8,
    username: 'Mario Ce$ar',
    password: '$2a$10$CHsIaT7qui0cGC6Z4ad.KOiZIlWyiSZiVzyQMVnylggvwoHgTQFBu', // hashed 'Mario Ce$ar'
    role: 'artist'
  }
];

// Helper to find user by username
function findUserByUsername(username) {
  return users.find(user => user.username === username);
}

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = findUserByUsername(username);
  if (!user) {
    return res.json({ success: false, message: 'Invalid username or password' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.json({ success: false, message: 'Invalid username or password' });
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;
  res.json({ success: true, redirect: '/dashboard' });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/user', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Could not log out');
    }
    res.redirect('/login');
  });
});

// Middleware to check if user is authenticated and is admin
const isAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Upload route - handles both album cover and audio file uploads
app.post('/upload', isAdmin, upload.fields([
  { name: 'albumCapa', maxCount: 1 },
  { name: 'audioFile', maxCount: 1 }
]), (req, res) => {
  try {
    if (!req.files || (!req.files.albumCapa && !req.files.audioFile)) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded.'
      });
    }

    const albumCapa = req.files.albumCapa ? req.files.albumCapa[0] : null;
    const audioFile = req.files.audioFile ? req.files.audioFile[0] : null;

    // Prepare response data
    const responseData = {
      success: true,
      message: 'Files uploaded successfully!',
      files: {}
    };

    if (albumCapa) {
      responseData.files.albumCapa = {
        filename: albumCapa.filename,
        originalname: albumCapa.originalname,
        mimetype: albumCapa.mimetype,
        size: albumCapa.size,
        path: `/uploads/${albumCapa.filename}`
      };
    }

    if (audioFile) {
      responseData.files.audioFile = {
        filename: audioFile.filename,
        originalname: audioFile.originalname,
        mimetype: audioFile.mimetype,
        size: audioFile.size,
        path: `/uploads/${audioFile.filename}`
      };
    }

    res.json(responseData);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message
    });
  }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 50MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});