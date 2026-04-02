const { prisma } = require('@lib/prisma');

async function getDashboard(userId) {
  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      deletedAt: null
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          price: true,
          lessons: {
            where: {
              deletedAt: null
            },
            select: {
              id: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const courses = await Promise.all(
    purchases.map(async (purchase) => {
      const lessonIds = purchase.course.lessons.map((lesson) => lesson.id);

      const progressRecords = lessonIds.length > 0
        ? await prisma.lessonProgress.findMany({
            where: {
              userId,
              lessonId: {
                in: lessonIds
              }
            }
          })
        : [];

      const completedLessons = progressRecords.filter((progress) => progress.completedAt !== null).length;

      return {
        purchase: {
          id: purchase.id,
          amount: purchase.amount,
          createdAt: purchase.createdAt
        },
        course: {
          id: purchase.course.id,
          title: purchase.course.title,
          slug: purchase.course.slug,
          thumbnailUrl: purchase.course.thumbnailUrl,
          price: purchase.course.price
        },
        totalLessons: lessonIds.length,
        completedLessons
      };
    })
  );

  return courses;
}

module.exports = {
  getDashboard
};