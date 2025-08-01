const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware for section reordering
const validateReorderRequest = [
    body('sectionOrder').isArray().withMessage('sectionOrder must be an array'),
    body('sectionOrder.*').isString().isIn([
        'areasOfInterest',
        'education', 
        'experience',
        'achievements',
        'projects',
        'positionOfResponsibility'
    ]).withMessage('Invalid section name in sectionOrder')
];

// Section reordering endpoint
router.post('/reorder-sections', 
    validateReorderRequest,
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Invalid reorder request',
                    details: errors.array(),
                    timestamp: new Date().toISOString()
                });
            }

            const { sectionOrder } = req.body;

            // Validate that all required sections are present
            const requiredSections = [
                'areasOfInterest',
                'education', 
                'experience',
                'achievements',
                'projects',
                'positionOfResponsibility'
            ];

            const missingSection = requiredSections.find(section => !sectionOrder.includes(section));
            if (missingSection) {
                return res.status(400).json({
                    error: 'Missing required section',
                    details: `Section '${missingSection}' is required`,
                    timestamp: new Date().toISOString()
                });
            }

            // Store the section order (in a real app, you'd save this to a database)
            // For now, we'll just return the validated order
            res.json({
                success: true,
                sectionOrder,
                message: 'Section order updated successfully',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            next(error);
        }
    }
);

// Get current section order endpoint
router.get('/section-order', (req, res) => {
    // Default section order
    const defaultOrder = [
        'areasOfInterest',
        'education', 
        'experience',
        'achievements',
        'projects',
        'positionOfResponsibility'
    ];

    res.json({
        success: true,
        sectionOrder: defaultOrder,
        sections: {
            areasOfInterest: { title: 'Areas of Interest', enabled: true },
            education: { title: 'Education', enabled: true },
            experience: { title: 'Professional Experience', enabled: true },
            achievements: { title: 'Achievements', enabled: true },
            projects: { title: 'Key Projects', enabled: true },
            positionOfResponsibility: { title: 'Position of Responsibility', enabled: true }
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;