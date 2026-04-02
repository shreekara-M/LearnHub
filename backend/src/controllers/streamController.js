const { prisma } = require('@lib/prisma');
const { AppError } = require('@middleware/errorHandler');
const { createSignedStreamUrl } = require('@services/cloudinaryService');
const { asyncHandler } = require('@utils/asyncHandler');

const STREAM_URL_EXPIRY_SECONDS = 900;

const streamLesson = asyncHandler(async (req, res) => {
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: req.params.lessonId
    },
    select: {
      id: true,
      videoUrl: true,
      isFree: true,
      courseId: true,
      deletedAt: true
    }
  });

  if (!lesson || lesson.deletedAt) {
    throw new AppError('Lesson not found.', 404, 'LESSON_NOT_FOUND');
  }

  if (!lesson.videoUrl || lesson.videoUrl === 'pending-upload') {
    throw new AppError('Video not found for this lesson.', 404, 'VIDEO_NOT_FOUND');
  }

  if (!lesson.isFree) {
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user.id,
        courseId: lesson.courseId,
        deletedAt: null
      },
      select: {
        id: true
      }
    });

    if (!purchase) {
      throw new AppError('You must purchase this course to access its content.', 403, 'COURSE_NOT_PURCHASED');
    }
  }

  res.status(200).json({
    success: true,
    streamUrl: createSignedStreamUrl(lesson.videoUrl, STREAM_URL_EXPIRY_SECONDS),
    expiresIn: STREAM_URL_EXPIRY_SECONDS
  });
});

module.exports = {
  streamLesson
};