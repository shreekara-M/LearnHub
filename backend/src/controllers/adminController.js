const { asyncHandler } = require('@utils/asyncHandler');
const adminService = require('@services/adminService');

function getPagination(query) {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);

  return {
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    limit: Number.isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100)
  };
}

const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();

  res.status(200).json({
    success: true,
    stats
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(getPagination(req.query));

  res.status(200).json({
    success: true,
    ...result
  });
});

const listPurchases = asyncHandler(async (req, res) => {
  const result = await adminService.listPurchases(getPagination(req.query));

  res.status(200).json({
    success: true,
    ...result
  });
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await adminService.getCourseWithLessons(req.params.id);

  res.status(200).json({
    success: true,
    course
  });
});

module.exports = {
  getStats,
  listUsers,
  listPurchases,
  getCourse
};