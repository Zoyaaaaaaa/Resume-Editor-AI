const express = require('express');
const { body, validationResult } = require('express-validator');
const PDFGenerator = require('../services/pdfGenerator');

const router = express.Router();

// Validation middleware for PDF generation
const validateResumeData = [
    body('personalInfo').optional().isObject(),
    body('personalInfo.fullName').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('personalInfo.email').optional().isEmail(),
    body('personalInfo.phone').optional().isString().trim().isLength({ max: 20 }),
    body('personalInfo.location').optional().isString().trim().isLength({ max: 100 }),
    body('areasOfInterest').optional().isString().trim().isLength({ max: 500 }),
    body('experience').optional().isArray(),
    body('projects').optional().isArray(),
    body('education').optional().isArray(),
    body('extracurricular').optional().isArray()
];

// Generate PDF endpoint
router.post('/generate-pdf', validateResumeData, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Invalid resume data',
                details: errors.array(),
                timestamp: new Date().toISOString()
            });
        }

        const resumeData = req.body;
        
        // Validate that we have at least some data
        if (!resumeData || Object.keys(resumeData).length === 0) {
            return res.status(400).json({
                error: 'No resume data provided',
                timestamp: new Date().toISOString()
            });
        }

        console.log('Generating PDF for resume data:', JSON.stringify(resumeData, null, 2));

        const generator = new PDFGenerator();
        const pdfBuffer = await generator.generatePDF(resumeData);

        console.log('PDF generated successfully, buffer size:', pdfBuffer.length, 'bytes');
        console.log('PDF buffer type in route:', typeof pdfBuffer);
        console.log('PDF buffer is Buffer in route:', Buffer.isBuffer(pdfBuffer));

        // Ensure buffer is valid
        if (!Buffer.isBuffer(pdfBuffer)) {
            console.error('PDF buffer is not a proper Buffer object');
            return res.status(500).json({
                error: 'Invalid PDF buffer generated',
                timestamp: new Date().toISOString()
            });
        }

        // Set appropriate headers for PDF download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="resume_${Date.now()}.pdf"`,
            'Content-Length': pdfBuffer.length,
            'Cache-Control': 'no-cache'
        });

        console.log('Sending PDF buffer to client...');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF generation error:', error);

        res.status(500).json({
            error: 'Failed to generate PDF',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// Preview PDF endpoint (returns base64 encoded PDF)
router.post('/preview-pdf', validateResumeData, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Invalid resume data',
                details: errors.array(),
                timestamp: new Date().toISOString()
            });
        }

        const resumeData = req.body;
        
        if (!resumeData || Object.keys(resumeData).length === 0) {
            return res.status(400).json({
                error: 'No resume data provided',
                timestamp: new Date().toISOString()
            });
        }

        const generator = new PDFGenerator();
        const pdfBuffer = await generator.generatePDF(resumeData);

        res.json({
            success: true,
            pdf: pdfBuffer.toString('base64'),
            size: pdfBuffer.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('PDF preview error:', error);

        res.status(500).json({
            error: 'Failed to generate PDF preview',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// Template options endpoint
router.get('/templates', (req, res) => {
    res.json({
        templates: [
            {
                id: 'professional-blue',
                name: 'Professional Blue',
                description: 'Clean professional template with blue headers',
                default: true
            },
            {
                id: 'modern-minimal',
                name: 'Modern Minimal',
                description: 'Minimalist design for modern professionals',
                default: false
            },
            {
                id: 'academic',
                name: 'Academic',
                description: 'Formal template suitable for academic positions',
                default: false
            }
        ],
        timestamp: new Date().toISOString()
    });
});

// PDF generation status endpoint
router.get('/pdf-status/:jobId', (req, res) => {
    // This would be used for async PDF generation if implemented
    res.json({
        jobId: req.params.jobId,
        status: 'completed',
        message: 'Synchronous generation - check /generate-pdf endpoint',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;