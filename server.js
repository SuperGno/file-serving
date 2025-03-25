const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Set up storage and file validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File type validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, or GIF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file limit
});

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// File upload route
app.post('/upload', (req, res) => {
    console.log('Upload attempt...');
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err.message);
            return res.redirect(`/?message=${encodeURIComponent(err.message)}`);
        }

        console.log('File uploaded:', req.file);
        res.redirect('/?message=File uploaded successfully!');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).send(`<h1>Something went wrong!</h1><p>${err.message}</p>`);
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
