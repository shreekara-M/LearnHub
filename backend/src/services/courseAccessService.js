const { prisma } = require('@lib/prisma');
const { AppError } = require('@middleware/errorHandler');

async function getPublicCourseList() {
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      deletedAt: null
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      price: true,
      _count: {
        select: {
          lessons: {
            where: {
              deletedAt: null
            }
          }
        }
      }
    }
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    thumbnailUrl: course.thumbnailUrl,
    price: course.price,
    lessonCount: course._count.lessons
  }));
}

async function getPublicCourseDetail(id) {
  const course = await prisma.course.findFirst({
    where: {
      id,
      isPublished: true,
      deletedAt: null
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnailUrl: true,
      price: true,
      createdAt: true,
      lessons: {
        where: {
          deletedAt: null
        },
        orderBy: {
          order: 'asc'
        },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          order: true,
          isFree: true
        }
      }
    }
  });

  if (!course) {
    throw new AppError('Course not found.', 404, 'NOT_FOUND');
  }

  return course;
}

async function getAccessibleCourse(id) {
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
          title: true,
          description: true,
          duration: true,
          order: true,
          isFree: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  if (!course) {
    throw new AppError('Course not found.', 404, 'NOT_FOUND');
  }

  return course;
}

async function getCourseProgress(courseId, userId) {
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
    throw new AppError('Course not found.', 404, 'NOT_FOUND');
  }

  return prisma.lessonProgress.findMany({
    where: {
      userId,
      lesson: {
        courseId,
        deletedAt: null
      }
    },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          order: true,
          duration: true,
          isFree: true
        }
      }
    },
    orderBy: {
      lesson: {
        order: 'asc'
      }
    }
  });
}

async function markLessonComplete(courseId, lessonId, userId, watchedSeconds) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      courseId,
      deletedAt: null
    },
    select: {
      id: true
    }
  });

  if (!lesson) {
    throw new AppError('Lesson not found.', 404, 'NOT_FOUND');
  }

  const existing = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId
      }
    }
  });

  const now = new Date();
  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId,
        lessonId
      }
    },
    create: {
      userId,
      lessonId,
      completedAt: now,
      watchedSeconds: watchedSeconds ?? 0
    },
    update: {
      completedAt: existing && existing.completedAt ? existing.completedAt : now,
      watchedSeconds: watchedSeconds ?? existing.watchedSeconds
    }
  });

  return {
    progress,
    created: !existing
  };
}

module.exports = {
  getPublicCourseList,
  getPublicCourseDetail,
  getAccessibleCourse,
  getCourseProgress,
  markLessonComplete
};