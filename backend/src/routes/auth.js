const express = require('express');
const { body } = require('express-validator');

const authController = require('@controllers/authController');
const { verifyToken } = require('@middleware/authMiddleware');
const { validate } = require('@utils/validate');

const router = express.Router();

const registerRules = [
  body('email')
    .isEmail()
    .withMessage('A valid email is required.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter.')
    .matches(/\d/)
    .withMessage('Password must contain at least one number.'),
  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters.')
];

const verifyOtpRules = [
  body('email')
    .isEmail()
    .withMessage('A valid email is required.')
    .normalizeEmail(),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP code must be 6 digits.')
    .isNumeric()
    .withMessage('OTP code must be numeric.')
];

const loginRules = [
  body('email')
    .isEmail()
    .withMessage('A valid email is required.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
];

const resendOtpRules = [
  body('email')
    .isEmail()
    .withMessage('A valid email is required.')
    .normalizeEmail()
];

router.post('/register', validate(registerRules), authController.register);
router.post('/verify-otp', validate(verifyOtpRules), authController.verifyOtp);
router.post('/login', validate(loginRules), authController.login);
router.post('/resend-otp', validate(resendOtpRules), authController.resendOtp);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.me);

module.exports = router;