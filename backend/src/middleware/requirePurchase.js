const { prisma } = require('@lib/prisma');
const { AppError } = require('@middleware/errorHandler');

async function requirePurchase(req, res, next) {
  try {
    if (!req.user) {
      return next(new AppError('Authentication is required.', 401, 'TOKEN_INVALID'));
    }

    const courseId = req.params.id || req.params.courseId;

    if (!courseId) {
      return next(new AppError('Course identifier is required.', 400, 'BAD_REQUEST'));
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: req.user.id,
        courseId,
        deletedAt: null
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        amount: true,
        createdAt: true
      }
    });

    if (!purchase) {
      return next(new AppError('You must purchase this course to access its content.', 403, 'COURSE_NOT_PURCHASED'));
    }

    req.purchase = purchase;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  requirePurchase
};