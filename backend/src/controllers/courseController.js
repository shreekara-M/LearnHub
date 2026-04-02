const { asyncHandler } = require('@utils/asyncHandler');
const courseService = require('@services/courseService');

const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.user.id, req.body);

  res.status(201).json({
    success: true,
    course
  });
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body);

  res.status(200).json({
    success: true,
    course
  });
});

const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.softDeleteCourse(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully.'
  });
});

const listCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.listCourses();

  res.status(200).json({
    success: true,
    courses
  });
});

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  listCourses
};