const express = require('express');
const { body, param } = require('express-validator');

const paymentController = require('@controllers/paymentController');
const { verifyToken } = require('@middleware/authMiddleware');
const { validate } = require('@utils/validate');

const router = express.Router();

const courseIdBody = [
  body('courseId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('courseId is required.')
];

const courseIdParam = [
  param('courseId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('courseId is required.')
];

router.post('/mock-purchase', verifyToken, validate(courseIdBody), paymentController.mockPurchase);
router.get('/status/:courseId', verifyToken, validate(courseIdParam), paymentController.getPurchaseStatus);

module.exports = router;