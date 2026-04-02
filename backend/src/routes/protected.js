const express = require('express');
const { body, param } = require('express-validator');

const courseAccessController = require('@controllers/courseAccessController');
const { verifyToken } = require('@middleware/authMiddleware');
const { requirePurchase } = require('@middleware/requirePurchase');
const { validate } = require('@utils/validate');

const router = express.Router();

const courseIdRules = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Course ID is required.')
];

const progressRules = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Course ID is required.'),
  param('lessonId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Lesson ID is required.'),
  body('watchedSeconds')
    .optional()
    .isInt({ min: 0 })
    .withMessage('watchedSeconds must be a non-negative integer.')
    .toInt()
];

router.use(verifyToken);

router.get('/:id/access', validate(courseIdRules), requirePurchase, courseAccessController.accessCourse);
router.get('/:id/progress', validate(courseIdRules), requirePurchase, courseAccessController.getCourseProgress);
router.post('/:id/progress/:lessonId', validate(progressRules), requirePurchase, courseAccessController.markLessonComplete);

module.exports = router;