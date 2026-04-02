const { prisma } = require('@lib/prisma');
const { AppError } = require('@middleware/errorHandler');
const { asyncHandler } = require('@utils/asyncHandler');

const mockPurchase = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      deletedAt: null,
      isPublished: true
    }
  });

  if (!course) {
    throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
  }

  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      userId,
      courseId,
      deletedAt: null
    }
  });

  if (existingPurchase) {
    res.status(200).json({
      success: true,
      purchase: existingPurchase,
      alreadyProcessed: true
    });
    return;
  }

  const timestamp = Date.now();
  const [, purchase] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        userId,
        courseId,
        razorpayOrderId: `mock_order_${timestamp}`,
        razorpayPaymentId: `mock_pay_${timestamp}`,
        razorpaySignature: 'mock_signature',
        amount: course.price,
        currency: 'INR',
        status: 'SUCCESS'
      }
    }),
    prisma.purchase.create({
      data: {
        userId,
        courseId,
        amount: course.price
      }
    })
  ]);

  res.status(201).json({
    success: true,
    purchase
  });
});

const getPurchaseStatus = asyncHandler(async (req, res) => {
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: req.user.id,
      courseId: req.params.courseId,
      deletedAt: null
    }
  });

  res.status(200).json({
    success: true,
    hasPurchase: purchase !== null,
    purchase: purchase || null
  });
});

module.exports = {
  mockPurchase,
  getPurchaseStatus
};