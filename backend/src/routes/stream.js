const express = require('express');
const { param } = require('express-validator');

const { verifyToken } = require('@middleware/authMiddleware');
const streamController = require('@controllers/streamController');
const { validate } = require('@utils/validate');

const router = express.Router();

const streamRules = [
  param('lessonId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Lesson ID is required.')
];

router.use(verifyToken);
router.get('/:lessonId/stream', validate(streamRules), streamController.streamLesson);

module.exports = router;