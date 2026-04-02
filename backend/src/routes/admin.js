const express = require('express');
const { body } = require('express-validator');

const adminController = require('@controllers/adminController');
const courseController = require('@controllers/courseController');
const lessonController = require('@controllers/lessonController');
const uploadController = require('@controllers/uploadController');
const { verifyToken, requireRole } = require('@middleware/authMiddleware');
const { validate } = require('@utils/validate');

const router = express.Router();

const courseCreateRules = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters.'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long.'),
  body('price')
    .isInt({ min: 0 })
    .withMessage('Price must be a non-negative integer.')
    .toInt(),
  body('thumbnailUrl')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Thumbnail URL must be a valid URL.')
];

const courseUpdateRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long.'),
  body('price')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Price must be a non-negative integer.')
    .toInt(),
  body('thumbnailUrl')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Thumbnail URL must be a valid URL.'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean value.')
    .toBoolean()
];

const lessonCreateRules = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters.'),
  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be an integer greater than or equal to 1.')
    .toInt(),
  body('videoUrl')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('videoUrl is required and must be a non-empty string.'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a non-negative integer.')
    .toInt(),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('isFree')
    .optional()
    .isBoolean()
    .withMessage('isFree must be a boolean value.')
    .toBoolean()
];

const lessonUpdateRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters.'),
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be an integer greater than or equal to 1.')
    .toInt(),
  body('videoUrl')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('videoUrl must be a non-empty string when provided.'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a non-negative integer.')
    .toInt(),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('isFree')
    .optional()
    .isBoolean()
    .withMessage('isFree must be a boolean value.')
    .toBoolean()
];

const reorderRules = [
  body('lessonIds')
    .isArray({ min: 1 })
    .withMessage('lessonIds must be a non-empty array.'),
  body('lessonIds.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each lesson ID must be a non-empty string.')
];

const uploadRules = [
  body('filename')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('filename is required.'),
  body('contentType')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('contentType is required.'),
  body('courseId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('courseId is required.')
];

router.use(verifyToken);
router.use(requireRole('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.get('/purchases', adminController.listPurchases);
router.post('/upload/presigned', validate(uploadRules), uploadController.getPresignedUpload);
router.post('/courses', validate(courseCreateRules), courseController.createCourse);
router.get('/courses', courseController.listCourses);
router.get('/courses/:id', adminController.getCourse);
router.put('/courses/:id', validate(courseUpdateRules), courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);
router.post('/courses/:courseId/lessons', validate(lessonCreateRules), lessonController.addLesson);
router.patch('/courses/:courseId/lessons/reorder', validate(reorderRules), lessonController.reorderLessons);
router.put('/courses/:courseId/lessons/:id', validate(lessonUpdateRules), lessonController.updateLesson);
router.delete('/courses/:courseId/lessons/:id', lessonController.deleteLesson);

module.exports = router;