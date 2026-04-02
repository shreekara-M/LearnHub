const { AppError } = require('@middleware/errorHandler');
const authService = require('@services/authService');
const { asyncHandler } = require('@utils/asyncHandler');
const {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  clearRefreshCookieOptions
} = require('@utils/cookie');

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const result = await authService.register(email, password, name);

  res.status(201).json({
    success: true,
    message: result.message
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const result = await authService.verifyOtp(email, code);

  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions());

  res.status(200).json({
    success: true,
    accessToken: result.accessToken,
    user: result.user
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions());

  res.status(200).json({
    success: true,
    accessToken: result.accessToken,
    user: result.user
  });
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendOtp(email);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

  if (!refreshToken) {
    throw new AppError('Refresh token is required.', 401, 'TOKEN_MISSING');
  }

  const result = await authService.refreshTokens(refreshToken);

  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions());

  res.status(200).json({
    success: true,
    accessToken: result.accessToken
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);

  res.status(200).json({
    success: true,
    user
  });
});

module.exports = {
  register,
  verifyOtp,
  login,
  resendOtp,
  refresh,
  logout,
  me
};