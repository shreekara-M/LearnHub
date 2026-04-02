const { prisma } = require('@lib/prisma');
const { AppError } = require('@middleware/errorHandler');

function toAdminLessonResponse(lesson) {
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

async function getStats() {
  const [totalUsers, totalCourses, revenueAggregate, totalEnrolments, recentPayments] = await Promise.all([
    prisma.user.count({
      where: {
        deletedAt: null
      }
    }),
    prisma.course.count({
      where: {
        deletedAt: null
      }
    }),
    prisma.payment.aggregate({
      where: {
        status: 'SUCCESS',
        deletedAt: null
      },
      _sum: {
        amount: true
      }
    }),
    prisma.purchase.count({
      where: {
        deletedAt: null
      }
    }),
    prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      }
    })
  ]);

  return {
    totalUsers,
    totalCourses,
    totalRevenue: revenueAggregate._sum.amount || 0,
    totalEnrolments,
    recentPayments
  };
}

async function listUsers(options) {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.user.count({
      where: {
        deletedAt: null
      }
    })
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1
  };
}

async function listPurchases(options) {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.purchase.findMany({
      where: {
        deletedAt: null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.purchase.count({
      where: {
        deletedAt: null
      }
    })
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1
  };
}

async function getCourseWithLessons(id) {
  const course = await prisma.course.findFirst({
    where: {
      id,
      deletedAt: null
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnailUrl: true,
      price: true,
      isPublished: true,
      instructorId: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      lessons: {
        where: {
          deletedAt: null
        },
        orderBy: {
          order: 'asc'
        },
        select: {
          id: true,
          courseId: true,
          title: true,
          description: true,
          videoUrl: true,
          duration: true,
          order: true,
          isFree: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  if (!course) {
    throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
  }

  return {
    ...course,
    lessons: course.lessons.map(toAdminLessonResponse)
  };
}

module.exports = {
  getStats,
  listUsers,
  listPurchases,
  getCourseWithLessons
};