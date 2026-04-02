const { asyncHandler } = require('@utils/asyncHandler');
const { getDashboard } = require('@services/userService');

const dashboard = asyncHandler(async (req, res) => {
  const courses = await getDashboard(req.user.id);

  res.json({
    success: true,
    courses
  });
});

module.exports = {
  dashboard
};