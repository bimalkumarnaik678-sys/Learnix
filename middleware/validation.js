import { body, validationResult } from 'express-validator';

// Validation middleware for quiz submission
export const validateQuizSubmission = [
    body('answers')
        .isArray({ min: 1 })
        .withMessage('Answers must be a non-empty array'),

    body('answers.*.questionId')
        .trim()
        .notEmpty()
        .withMessage('Question ID is required')
        .isMongoId()
        .withMessage('Invalid question ID format'),

    body('answers.*.response')
        .custom((value) => {
            // Allow string, array, or null/undefined
            if (value === null || value === undefined) return true;
            if (typeof value === 'string') return true;
            if (Array.isArray(value)) return true;
            throw new Error('Response must be a string, array, or null');
        }),

    body('startedAt')
        .notEmpty()
        .withMessage('Start time is required')
        .isISO8601()
        .withMessage('Invalid date format'),

    // Middleware to check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

// Sanitize text inputs to prevent XSS
export const sanitizeTextInput = (text) => {
    if (typeof text !== 'string') return text;

    // Remove HTML tags
    let sanitized = text.replace(/<[^>]*>/g, '');

    // Escape special characters
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    return sanitized.trim();
};

// Middleware to sanitize all string inputs in request body
export const sanitizeInputs = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeTextInput(req.body[key]);
            } else if (Array.isArray(req.body[key])) {
                req.body[key] = req.body[key].map(item =>
                    typeof item === 'string' ? sanitizeTextInput(item) : item
                );
            } else if (typeof req.body[key] === 'object' && req.body[key] !== null) {
                // Recursively sanitize nested objects
                const sanitizeObject = (obj) => {
                    Object.keys(obj).forEach(nestedKey => {
                        if (typeof obj[nestedKey] === 'string') {
                            obj[nestedKey] = sanitizeTextInput(obj[nestedKey]);
                        } else if (Array.isArray(obj[nestedKey])) {
                            obj[nestedKey] = obj[nestedKey].map(item =>
                                typeof item === 'string' ? sanitizeTextInput(item) : item
                            );
                        } else if (typeof obj[nestedKey] === 'object' && obj[nestedKey] !== null) {
                            sanitizeObject(obj[nestedKey]);
                        }
                    });
                };
                sanitizeObject(req.body[key]);
            }
        });
    }
    next();
};
