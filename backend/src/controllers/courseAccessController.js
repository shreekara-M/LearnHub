const { asyncHandler } = require('@utils/asyncHandler');
const courseAccessService = require('@services/courseAccessService');

const listCourses = asyncHandler(async (req, res) => {
  const courses = await courseAccessService.getPublicCourseList();

  res.status(200).json({
    success: true,
    courses
  });
});

const getCourseDetail = asyncHandler(async (req, res) => {
  const course = await courseAccessService.getPublicCourseDetail(req.params.id);

  res.status(200).json({
    success: true,
    course
  });
});

const accessCourse = asyncHandler(async (req, res) => {
  const course = await courseAccessService.getAccessibleCourse(req.params.id);

  res.status(200).json({
    success: true,
    course
  });
});

const getCourseProgress = asyncHandler(async (req, res) => {
  const progress = await courseAccessService.getCourseProgress(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    progress
  });
});

const markLessonComplete = asyncHandler(async (req, res) => {
  const result = await courseAccessService.markLessonComplete(
    req.params.id,
    req.params.lessonId,
    req.user.id,
    req.body.watchedSeconds
  );

  res.status(200).json({
    success: true,
    progress: result.progress,
    created: result.created
  });
});

module.exports = {
  listCourses,
  getCourseDetail,
  accessCourse,
  getCourseProgress,
  markLessonComplete
};