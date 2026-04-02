const { prisma } = require('@lib/prisma');
const { AppError } = require('@middleware/errorHandler');
const { verifyAccessToken } = require('@utils/jwt');

async function verifyToken(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return next(new AppError('Access token is required.', 401, 'TOKEN_MISSING'));
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return next(new AppError('Access token is required.', 401, 'TOKEN_MISSING'));
    }

    let decoded;

    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Access token has expired.', 401, 'TOKEN_EXPIRED'));
      }

      return next(new AppError('Invalid access token.', 401, 'TOKEN_INVALID'));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        deletedAt: true
      }
    });

    if (!user || user.deletedAt) {
      return next(new AppError('Invalid access token.', 401, 'TOKEN_INVALID'));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireRole(...roles) {
  return function requireRoleMiddleware(req, res, next) {
    if (!req.user) {
      return next(new AppError('Invalid access token.', 401, 'TOKEN_INVALID'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have access to this resource.', 403, 'FORBIDDEN'));
    }

    return next();
  };
}

module.exports = {
  verifyToken,
  requireRole
};