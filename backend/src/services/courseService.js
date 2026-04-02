const { prisma } = require('@lib/prisma');
const { AppError } = require('@middleware/errorHandler');

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function createCourse(instructorId, payload) {
  const { title, description, price, thumbnailUrl } = payload;

  return prisma.course.create({
    data: {
      instructorId,
      title,
      slug: slugifyTitle(title),
      description,
      price,
      thumbnailUrl: thumbnailUrl || null
    }
  });
}

async function updateCourse(id, data) {
  const course = await prisma.course.findFirst({
    where: {
      id,
      deletedAt: null
    }
  });

  if (!course) {
    throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
  }

  const updateData = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
    updateData.slug = slugifyTitle(data.title);
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.price !== undefined) {
    updateData.price = data.price;
  }

  if (data.thumbnailUrl !== undefined) {
    updateData.thumbnailUrl = data.thumbnailUrl || null;
  }

  if (data.isPublished !== undefined) {
    updateData.isPublished = data.isPublished;
  }

  if (Object.keys(updateData).length === 0) {
    return course;
  }

  return prisma.course.update({
    where: { id },
    data: updateData
  });
}

async function softDeleteCourse(id) {
  const course = await prisma.course.findFirst({
    where: {
      id,
      deletedAt: null
    }
  });

  if (!course) {
    throw new AppError('Course not found.', 404, 'COURSE_NOT_FOUND');
  }

  return prisma.course.update({
    where: { id },
    data: {
      deletedAt: new Date()
    }
  });
}

async function listCourses() {
  return prisma.course.findMany({
    where: {
      deletedAt: null
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
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
}

module.exports = {
  createCourse,
  updateCourse,
  softDeleteCourse,
  listCourses
};