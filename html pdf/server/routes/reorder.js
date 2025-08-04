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
        'positionOfResponsibility',
        'skills',
        'publications'
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

            // Validate that all sections in the order are valid
            // (No longer requiring ALL sections to be present - allows for flexible section management)
            console.log('Received section order:', sectionOrder);

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
        'positionOfResponsibility',
        'skills',
        'publications'
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
            positionOfResponsibility: { title: 'Position of Responsibility', enabled: true },
            skills: { title: 'Skills', enabled: true },
            publications: { title: 'Publications', enabled: true }
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;