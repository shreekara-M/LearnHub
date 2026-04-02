const path = require('path');

const { v4: uuid } = require('uuid');

const { prisma } = require('@lib/prisma');
const { AppError } = require('@middleware/errorHandler');
const { getSignedUploadParams } = require('@services/cloudinaryService');
const { asyncHandler } = require('@utils/asyncHandler');

const ALLOWED_VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm', '.mkv', '.m4v', '.avi', '.ogv']);

const getPresignedUpload = asyncHandler(async (req, res) => {
  const { filename, contentType, courseId } = req.body;

  if (!contentType.startsWith('video/')) {
    throw new AppError('Only video uploads are allowed.', 400, 'INVALID_CONTENT_TYPE');
  }

  const extension = path.extname(filename || '').toLowerCase();

  if (!ALLOWED_VIDEO_EXTENSIONS.has(extension)) {
    throw new AppError('Unsupported video file extension.', 400, 'INVALID_FILE_EXTENSION');
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (!course) {
    throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
  }

  const folder = `lms/videos/${courseId}`;
  const publicId = uuid();
  const uploadParams = getSignedUploadParams(folder, publicId);

  res.status(200).json({
    success: true,
    ...uploadParams
  });
});

module.exports = {
  getPresignedUpload
};