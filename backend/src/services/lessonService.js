const { prisma } = require('@lib/prisma');
const { AppError } = require('@middleware/errorHandler');

async function ensureActiveCourse(courseId) {
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

  return course;
}

async function addLesson(courseId, payload) {
  await ensureActiveCourse(courseId);

  return prisma.lesson.create({
    data: {
      courseId,
      title: payload.title,
      description: payload.description || null,
      videoUrl: payload.videoUrl,
      duration: payload.duration ?? 0,
      order: payload.order,
      isFree: payload.isFree ?? false
    }
  });
}

async function updateLesson(courseId, id, data) {
  await ensureActiveCourse(courseId);

  const lesson = await prisma.lesson.findFirst({
    where: {
      id,
      courseId,
      deletedAt: null
    }
  });

  if (!lesson) {
    throw new AppError('Lesson not found.', 404, 'LESSON_NOT_FOUND');
  }

  const updateData = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.videoUrl !== undefined) {
    updateData.videoUrl = data.videoUrl;
  }

  if (data.duration !== undefined) {
    updateData.duration = data.duration;
  }

  if (data.order !== undefined) {
    updateData.order = data.order;
  }

  if (data.isFree !== undefined) {
    updateData.isFree = data.isFree;
  }

  if (Object.keys(updateData).length === 0) {
    return lesson;
  }

  return prisma.lesson.update({
    where: { id },
    data: updateData
  });
}

async function deleteLesson(courseId, id) {
  await ensureActiveCourse(courseId);

  const lesson = await prisma.lesson.findFirst({
    where: {
      id,
      courseId
    }
  });

  if (!lesson) {
    throw new AppError('Lesson not found.', 404, 'LESSON_NOT_FOUND');
  }

  return prisma.lesson.delete({
    where: { id }
  });
}

async function reorderLessons(courseId, lessonIds) {
  await ensureActiveCourse(courseId);

  const uniqueLessonIds = [...new Set(lessonIds)];

  if (uniqueLessonIds.length !== lessonIds.length) {
    throw new AppError('Lesson IDs must be unique for reordering.', 400, 'INVALID_LESSON_ORDER');
  }

  const activeLessons = await prisma.lesson.findMany({
    where: {
      courseId,
      deletedAt: null
    },
    select: {
      id: true
    },
    orderBy: {
      order: 'asc'
    }
  });

  const activeLessonIds = activeLessons.map((lesson) => lesson.id);
  const allIdsBelongToCourse = uniqueLessonIds.every((lessonId) => activeLessonIds.includes(lessonId));

  if (!allIdsBelongToCourse) {
    throw new AppError('All lesson IDs must belong to the specified course.', 400, 'INVALID_LESSON_ORDER');
  }

  const remainingLessonIds = activeLessonIds.filter((lessonId) => !uniqueLessonIds.includes(lessonId));
  const finalLessonOrder = [...uniqueLessonIds, ...remainingLessonIds];
  const temporaryOffset = finalLessonOrder.length + 1000;

  await prisma.$transaction(async (tx) => {
    for (let index = 0; index < finalLessonOrder.length; index += 1) {
      await tx.lesson.update({
        where: { id: finalLessonOrder[index] },
        data: {
          order: temporaryOffset + index
        }
      });
    }

    for (let index = 0; index < finalLessonOrder.length; index += 1) {
      await tx.lesson.update({
        where: { id: finalLessonOrder[index] },
        data: {
          order: index + 1
        }
      });
    }
  });

  return prisma.lesson.findMany({
    where: {
      courseId,
      deletedAt: null
    },
    orderBy: {
      order: 'asc'
    }
  });
}

module.exports = {
  addLesson,
  updateLesson,
  deleteLesson,
  reorderLessons
};