const express = require('express');
const { param } = require('express-validator');

const courseAccessController = require('@controllers/courseAccessController');
const { validate } = require('@utils/validate');

const router = express.Router();

const courseIdRules = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Course ID is required.')
];

router.get('/', courseAccessController.listCourses);
router.get('/:id', validate(courseIdRules), courseAccessController.getCourseDetail);

module.exports = router;