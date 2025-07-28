const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

const ResumeParser = require('../services/resumeParser');
const { createTempDir, cleanupTempFiles } = require('../utils/fileUtils');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const tempDir = await createTempDir();
            cb(null, tempDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
        }
    }
});

// Parse resume endpoint
router.post('/parse-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                timestamp: new Date().toISOString()
            });
        }

        console.log('Processing uploaded file:', req.file.filename);

        const parser = new ResumeParser();
        const resumeData = await parser.parseResume(req.file.path, req.file.mimetype);

        // Clean up uploaded file
        try {
            await fs.unlink(req.file.path);
        } catch (cleanupError) {
            console.warn('Failed to cleanup uploaded file:', cleanupError.message);
        }

        res.json({
            success: true,
            data: resumeData,
            filename: req.file.originalname,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Resume parsing error:', error);

        // Clean up file on error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (cleanupError) {
                console.warn('Failed to cleanup file after error:', cleanupError.message);
            }
        }

        res.status(500).json({
            error: 'Failed to parse resume',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// Test upload endpoint (for development)
router.post('/test-upload', upload.single('testFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
        message: 'File uploaded successfully',
        file: {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        }
    });
});

// Error handler for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large. Maximum size is 10MB.',
                timestamp: new Date().toISOString()
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Too many files. Only one file allowed.',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }

    next(error);
});

module.exports = router;