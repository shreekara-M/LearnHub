const REFRESH_COOKIE_NAME = 'lms_rt';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

function clearRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth'
  };
}

module.exports = {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  clearRefreshCookieOptions
};