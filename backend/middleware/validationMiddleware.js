const { body, validationResult } = require('express-validator');

const loginValidation = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const createVisitorValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('purpose').notEmpty().withMessage('Purpose is required'),
    body('idProofNumber').notEmpty().withMessage('ID proof number is required'),
    body('personToMeet').notEmpty().withMessage('Person to meet is required'),
];

const createSecurityUserValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }
    next();
};

module.exports = {
    loginValidation,
    createVisitorValidation,
    createSecurityUserValidation,
    validate,
};
