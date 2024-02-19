const { check } = require('express-validator');

exports.registerValidator = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check('mobile', 'Mobile no. should contain 10 digits').isLength({ min: 10, max: 10 }),
    check('password', 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character')
        .isStrongPassword({ minLength: 6, minUppercase: 1, minLowercase: 1, minNumbers: 1 }),
    check('image').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('Please upload an image');
        }
        if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {
            return true;
        } else {
            return false;
        }
    }).withMessage('Please upload an image in JPEG or PNG format')
];

exports.loginValidator = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check('password', 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character')
        .isStrongPassword({ minLength: 6, minUppercase: 1, minLowercase: 1, minNumbers: 1 }),

];

exports.otpMailValidator = [
    check('email', 'Please Enter a valid email').isEmail().normalizeEmail({ gmail_remove_dots: true }),
  

];
