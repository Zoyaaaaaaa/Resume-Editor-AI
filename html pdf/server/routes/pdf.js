// const express = require('express');
// const { body, validationResult, header } = require('express-validator');
// const PDFGenerator = require('../services/pdfGenerator');

// const router = express.Router();

// // Validation middleware for PDF generation
// const validateResumeData = [
//     body('personalInfo').optional().isObject(),
//     body('personalInfo.fullName').optional().isString().trim().isLength({ min: 1, max: 100 }),
//     body('personalInfo.email').optional().isEmail(),
//     body('personalInfo.phone').optional().isString().trim().isLength({ max: 20 }),
//     body('personalInfo.location').optional().isString().trim().isLength({ max: 100 }),
//     body('areasOfInterest').optional().isString().trim().isLength({ max: 500 }),
//     body('skills').optional().isString().trim().isLength({ max: 500 }),
//     body('experience').optional().isArray(),
//     body('publications').optional().isArray(),
//     body('projects').optional().isArray(),
//     body('education').optional().isArray(),
//     body('extracurricular').optional().isArray(),
//     body('fontFamily').optional().isString(),
//     body('headerColor').optional().isHexColor(),
// ];

// // Generate PDF endpoint
// router.post('/generate-pdf', validateResumeData, async (req, res) => {
//     try {
//         // Check for validation errors
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 error: 'Invalid resume data',
//                 details: errors.array(),
//                 timestamp: new Date().toISOString()
//             });
//         }

//         const resumeData = req.body;
        
//         // Validate that we have at least some data
//         if (!resumeData || Object.keys(resumeData).length === 0) {
//             return res.status(400).json({
//                 error: 'No resume data provided',
//                 timestamp: new Date().toISOString()
//             });
//         }

//         console.log('Generating PDF for resume data:', JSON.stringify(resumeData, null, 2));

//         const generator = new PDFGenerator();
//         const fontFamily = resumeData.fontFamily || "'Calibri', sans-serif";
//         // const headerColor=resumeData.headerColor
//         // console.log("header color->",headerColor);
//         console.log("FONT->",fontFamily);
//         const pdfBuffer = await generator.generatePDF(resumeData,fontFamily);
        
//         console.log('PDF generated successfully, buffer size:', pdfBuffer.length, 'bytes');
//         console.log('PDF buffer type in route:', typeof pdfBuffer);
//         console.log('PDF buffer is Buffer in route:', Buffer.isBuffer(pdfBuffer));

//         // Ensure buffer is valid
//         if (!Buffer.isBuffer(pdfBuffer)) {
//             console.error('PDF buffer is not a proper Buffer object');
//             return res.status(500).json({
//                 error: 'Invalid PDF buffer generated',
//                 timestamp: new Date().toISOString()
//             });
//         }

//         // Set appropriate headers for PDF download
//         res.set({
//             'Content-Type': 'application/pdf',
//             'Content-Disposition': `attachment; filename="resume_${Date.now()}.pdf"`,
//             'Content-Length': pdfBuffer.length,
//             'Cache-Control': 'no-cache'
//         });

//         console.log('Sending PDF buffer to client...');
//         res.send(pdfBuffer);

//     } catch (error) {
//         console.error('PDF generation error:', error);

//         res.status(500).json({
//             error: 'Failed to generate PDF',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined,
//             timestamp: new Date().toISOString()
//         });
//     }
// });

// // Preview PDF endpoint (returns base64 encoded PDF)
// router.post('/preview-pdf', validateResumeData, async (req, res) => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 error: 'Invalid resume data',
//                 details: errors.array(),
//                 timestamp: new Date().toISOString()
//             });
//         }

//         const resumeData = req.body;
        
//         if (!resumeData || Object.keys(resumeData).length === 0) {
//             return res.status(400).json({
//                 error: 'No resume data provided',
//                 timestamp: new Date().toISOString()
//             });
//         }

//         const generator = new PDFGenerator();
//         const pdfBuffer = await generator.generatePDF(resumeData);

//         res.json({
//             success: true,
//             pdf: pdfBuffer.toString('base64'),
//             size: pdfBuffer.length,
//             timestamp: new Date().toISOString()
//         });

//     } catch (error) {
//         console.error('PDF preview error:', error);

//         res.status(500).json({
//             error: 'Failed to generate PDF preview',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined,
//             timestamp: new Date().toISOString()
//         });
//     }
// });

// // Template options endpoint
// router.get('/templates', (req, res) => {
//     res.json({
//         templates: [
//             {
//                 id: 'professional-blue',
//                 name: 'Professional Blue',
//                 description: 'Clean professional template with blue headers',
//                 default: true
//             },
//             {
//                 id: 'modern-minimal',
//                 name: 'Modern Minimal',
//                 description: 'Minimalist design for modern professionals',
//                 default: false
//             },
//             {
//                 id: 'academic',
//                 name: 'Academic',
//                 description: 'Formal template suitable for academic positions',
//                 default: false
//             }
//         ],
//         timestamp: new Date().toISOString()
//     });
// });

// // PDF generation status endpoint
// router.get('/pdf-status/:jobId', (req, res) => {
//     // This would be used for async PDF generation if implemented
//     res.json({
//         jobId: req.params.jobId,
//         status: 'completed',
//         message: 'Synchronous generation - check /generate-pdf endpoint',
//         timestamp: new Date().toISOString()
//     });
// });

// module.exports = router;

const express = require('express');
const { body, validationResult, header } = require('express-validator');
const PDFGenerator = require('../services/pdfGenerator');

const router = express.Router();

// Enhanced validation middleware for PDF generation
const validateResumeData = [
    // Personal Info validation
    body('personalInfo').optional().isObject(),
    body('personalInfo.fullName').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('personalInfo.email').optional().isEmail(),
    body('personalInfo.phone').optional().isString().trim().isLength({ max: 20 }),
    body('personalInfo.location').optional().isString().trim().isLength({ max: 100 }),
    
    // Content validation
    body('areasOfInterest').optional().isString().trim().isLength({ max: 500 }),
    body('skills').optional().isString().trim().isLength({ max: 500 }),
    body('experience').optional().isArray(),
    body('publications').optional().isArray(),
    body('projects').optional().isArray(),
    body('education').optional().isArray(),
    body('achievements').optional().isArray(),
    body('positionOfResponsibility').optional().isArray(),
    body('technicalSkills').optional().isArray(),
    body('extraCurricular').optional().isArray(),
    body('sectionOrder').optional().isArray(),
    
    // Style validation
    body('fontFamily').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('headerColor').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
];

// Utility function to sanitize and validate font family
function sanitizeFontFamily(fontFamily) {
    console.log('🔤 Sanitizing font family:', fontFamily);
    
    // Default font families
    const validFonts = {
        'Calibri': "'Calibri', sans-serif",
        'Arial': "'Arial', sans-serif",
        'Times New Roman': "'Times New Roman', serif",
        'Georgia': "'Georgia', serif"
    };
    
    if (!fontFamily || fontFamily === 'undefined' || typeof fontFamily !== 'string') {
        console.warn('⚠️ Invalid font family, using Calibri default');
        return "'Calibri', sans-serif";
    }
    
    // Check if it's a known font
    for (const [key, value] of Object.entries(validFonts)) {
        if (fontFamily.includes(key)) {
            console.log('✅ Valid font found:', value);
            return value;
        }
    }
    
    // If it's already properly formatted (contains quotes)
    if (fontFamily.includes("'") || fontFamily.includes('"')) {
        console.log('✅ Font already properly formatted:', fontFamily);
        return fontFamily;
    }
    
    // Default fallback
    console.warn('⚠️ Unknown font family, using Calibri default');
    return "'Calibri', sans-serif";
}

// Utility function to validate header color
function sanitizeHeaderColor(headerColor) {
    console.log('🎨 Sanitizing header color:', headerColor);
    
    const validColors = {
        '#2c3e50': 'Dark Blue (Default)',
        '#1abc9c': 'Teal',
        '#e74c3c': 'Red',
        '#8e44ad': 'Purple',
        '#34495e': 'Navy',
        '#27ae60': 'Green'
    };
    
    if (!headerColor || typeof headerColor !== 'string') {
        console.warn('⚠️ Invalid header color, using default');
        return '#2c3e50';
    }
    
    // Check if it's a valid hex color
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexColorRegex.test(headerColor)) {
        console.log('✅ Valid hex color:', headerColor);
        return headerColor;
    }
    
    // Check if it's one of our predefined colors
    if (validColors[headerColor]) {
        console.log('✅ Valid predefined color:', headerColor);
        return headerColor;
    }
    
    console.warn('⚠️ Invalid color format, using default');
    return '#2c3e50';
}

// Generate PDF endpoint
router.post('/generate-pdf', validateResumeData, async (req, res) => {
    console.log('🚀 PDF Generation Request Started');
    console.log('📝 Request Body Keys:', Object.keys(req.body));
    
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('❌ Validation errors:', errors.array());
            return res.status(400).json({
                error: 'Invalid resume data',
                details: errors.array(),
                timestamp: new Date().toISOString()
            });
        }

        const resumeData = req.body;
        
        // Validate that we have at least some data
        if (!resumeData || Object.keys(resumeData).length === 0) {
            console.error('❌ No resume data provided');
            return res.status(400).json({
                error: 'No resume data provided',
                timestamp: new Date().toISOString()
            });
        }

        console.log('📋 Resume Data Summary:');
        console.log('  - Personal Info:', !!resumeData.personalInfo);
        console.log('  - Experience entries:', resumeData.experience?.length || 0);
        console.log('  - Education entries:', resumeData.education?.length || 0);
        console.log('  - Projects entries:', resumeData.projects?.length || 0);
        console.log('  - Raw Font Family:', resumeData.fontFamily);
        console.log('  - Raw Header Color:', resumeData.headerColor);

        // Sanitize style parameters
        const fontFamily = sanitizeFontFamily(resumeData.fontFamily);
        const headerColor = sanitizeHeaderColor(resumeData.headerColor);
        
        console.log('🎨 Style Parameters:');
        console.log('  - Final Font Family:', fontFamily);
        console.log('  - Final Header Color:', headerColor);

        // Create generator and generate PDF
        const generator = new PDFGenerator();
        console.log('⚙️ Generating PDF...');
        
        const pdfBuffer = await generator.generatePDF(resumeData, fontFamily, headerColor);
        
        console.log('✅ PDF Generated Successfully:');
        console.log('  - Buffer size:', pdfBuffer.length, 'bytes');
        console.log('  - Buffer type:', typeof pdfBuffer);
        console.log('  - Is Buffer:', Buffer.isBuffer(pdfBuffer));

        // Ensure buffer is valid
        if (!Buffer.isBuffer(pdfBuffer)) {
            console.error('❌ PDF buffer is not a proper Buffer object');
            return res.status(500).json({
                error: 'Invalid PDF buffer generated',
                timestamp: new Date().toISOString()
            });
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `resume_${resumeData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'document'}_${timestamp}.pdf`;
        
        // Set appropriate headers for PDF download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length,
            'Cache-Control': 'no-cache',
            'X-Font-Family': fontFamily,
            'X-Header-Color': headerColor
        });

        console.log('📤 Sending PDF to client...');
        console.log('📁 Filename:', filename);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('❌ PDF Generation Error:', error);
        console.error('🔍 Error Stack:', error.stack);

        res.status(500).json({
            error: 'Failed to generate PDF',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                fontFamily: req.body.fontFamily,
                headerColor: req.body.headerColor
            } : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// Enhanced preview PDF endpoint (returns base64 encoded PDF)
router.post('/preview-pdf', validateResumeData, async (req, res) => {
    console.log('👀 PDF Preview Request Started');
    
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('❌ Validation errors for preview:', errors.array());
            return res.status(400).json({
                error: 'Invalid resume data',
                details: errors.array(),
                timestamp: new Date().toISOString()
            });
        }

        const resumeData = req.body;
        
        if (!resumeData || Object.keys(resumeData).length === 0) {
            console.error('❌ No resume data provided for preview');
            return res.status(400).json({
                error: 'No resume data provided',
                timestamp: new Date().toISOString()
            });
        }

        // Sanitize style parameters for preview
        const fontFamily = sanitizeFontFamily(resumeData.fontFamily);
        const headerColor = sanitizeHeaderColor(resumeData.headerColor);
        
        console.log('🎨 Preview Style Parameters:');
        console.log('  - Font Family:', fontFamily);
        console.log('  - Header Color:', headerColor);

        const generator = new PDFGenerator();
        console.log('⚙️ Generating preview PDF...');
        
        const pdfBuffer = await generator.generatePDF(resumeData, fontFamily, headerColor);

        console.log('✅ Preview PDF generated successfully');
        console.log('📊 Preview buffer size:', pdfBuffer.length, 'bytes');

        res.json({
            success: true,
            pdf: pdfBuffer.toString('base64'),
            size: pdfBuffer.length,
            fontFamily: fontFamily,
            headerColor: headerColor,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ PDF Preview Error:', error);

        res.status(500).json({
            error: 'Failed to generate PDF preview',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

// Template options endpoint with font and color support
router.get('/templates', (req, res) => {
    console.log('📋 Template options requested');
    
    res.json({
        templates: [
            {
                id: 'professional-blue',
                name: 'Professional Blue',
                description: 'Clean professional template with blue headers',
                defaultFont: "'Calibri', sans-serif",
                defaultColor: '#2c3e50',
                default: true
            },
            {
                id: 'modern-minimal',
                name: 'Modern Minimal',
                description: 'Minimalist design for modern professionals',
                defaultFont: "'Arial', sans-serif",
                defaultColor: '#34495e',
                default: false
            },
            {
                id: 'academic',
                name: 'Academic',
                description: 'Formal template suitable for academic positions',
                defaultFont: "'Times New Roman', serif",
                defaultColor: '#2c3e50',
                default: false
            }
        ],
        fontOptions: [
            { value: "'Calibri', sans-serif", label: 'Calibri' },
            { value: "'Arial', sans-serif", label: 'Arial' },
            { value: "'Times New Roman', serif", label: 'Times New Roman' },
            { value: "'Verdana', sans-serif", label: 'Verdana' },
            { value: "'Georgia', serif", label: 'Georgia' }
        ],
        colorOptions: [
            { value: '#2c3e50', label: 'Dark Blue (Default)' },
            { value: '#1abc9c', label: 'Teal' },
            { value: '#e74c3c', label: 'Red' },
            { value: '#8e44ad', label: 'Purple' },
            { value: '#34495e', label: 'Navy' },
            { value: '#27ae60', label: 'Green' }
        ],
        timestamp: new Date().toISOString()
    });
});

// Style validation endpoint
router.post('/validate-style', (req, res) => {
    const { fontFamily, headerColor } = req.body;
    
    console.log('🎨 Style validation requested:', { fontFamily, headerColor });
    
    const validatedFont = sanitizeFontFamily(fontFamily);
    const validatedColor = sanitizeHeaderColor(headerColor);
    
    res.json({
        valid: true,
        sanitized: {
            fontFamily: validatedFont,
            headerColor: validatedColor
        },
        original: {
            fontFamily: fontFamily,
            headerColor: headerColor
        },
        timestamp: new Date().toISOString()
    });
});

// PDF generation status endpoint
router.get('/pdf-status/:jobId', (req, res) => {
    console.log('📊 PDF status check for job:', req.params.jobId);
    
    res.json({
        jobId: req.params.jobId,
        status: 'completed',
        message: 'Synchronous generation - check /generate-pdf endpoint',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'PDF Generation API',
        timestamp: new Date().toISOString(),
        features: {
            fontCustomization: true,
            headerColorCustomization: true,
            templateSupport: true,
            validation: true
        }
    });
});

module.exports = router;