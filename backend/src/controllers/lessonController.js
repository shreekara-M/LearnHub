const { asyncHandler } = require('@utils/asyncHandler');
const lessonService = require('@services/lessonService');

function toLessonResponse(lesson) {
  return {
    id: lesson.id,
    courseId: lesson.courseId,
    title: lesson.title,
    description: lesson.description,
    duration: lesson.duration,
    order: lesson.order,
    isFree: lesson.isFree,
    deletedAt: lesson.deletedAt,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
    hasVideo: Boolean(lesson.videoUrl && lesson.videoUrl !== 'pending-upload')
  };
}

const addLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.addLesson(req.params.courseId, req.body);

  res.status(201).json({
    success: true,
    lesson: toLessonResponse(lesson)
  });
});

const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.updateLesson(req.params.courseId, req.params.id, req.body);

  res.status(200).json({
    success: true,
    lesson: toLessonResponse(lesson)
  });
});

const deleteLesson = asyncHandler(async (req, res) => {
  await lessonService.deleteLesson(req.params.courseId, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Lesson deleted successfully.'
  });
});

const reorderLessons = asyncHandler(async (req, res) => {
  const lessons = await lessonService.reorderLessons(req.params.courseId, req.body.lessonIds);

  res.status(200).json({
    success: true,
    lessons: lessons.map(toLessonResponse)
  });
});

module.exports = {
  addLesson,
  updateLesson,
  deleteLesson,
  reorderLessons
};