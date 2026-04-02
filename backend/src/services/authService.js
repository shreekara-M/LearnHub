const bcrypt = require('bcrypt');

const { prisma } = require('@lib/prisma');
const { AppError } = require('@middleware/errorHandler');
const { sendOtpEmail } = require('@services/emailService');
const { generateOtpCode } = require('@utils/otp');
const { generateTokenPair, verifyRefreshToken } = require('@utils/jwt');

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_WINDOW_MS = 60 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function getSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    createdAt: user.createdAt
  };
}

async function register(email, password, name) {
  const existingVerifiedUser = await prisma.user.findFirst({
    where: {
      email,
      isVerified: true,
      deletedAt: null
    },
    select: { id: true }
  });

  if (existingVerifiedUser) {
    throw new AppError('An account already exists for this email.', 409, 'ALREADY_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.otp.updateMany({
    where: {
      email,
      purpose: 'EMAIL_VERIFY',
      used: false
    },
    data: {
      used: true
    }
  });

  const plainCode = generateOtpCode();
  const hashedCode = await bcrypt.hash(plainCode, 10);

  await prisma.otp.create({
    data: {
      email,
      code: hashedCode,
      purpose: 'EMAIL_VERIFY',
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      passwordHash,
      name: name || null,
      used: false,
      attempts: 0
    }
  });

  await sendOtpEmail(email, plainCode, name);

  return {
    message: 'Verification code sent to your email.'
  };
}

async function verifyOtp(email, code) {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      purpose: 'EMAIL_VERIFY',
      used: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!otpRecord) {
    throw new AppError('Verification code not found or expired.', 400, 'OTP_NOT_FOUND');
  }

  if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError('Maximum OTP verification attempts reached.', 429, 'OTP_MAX_ATTEMPTS');
  }

  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: {
      attempts: {
        increment: 1
      }
    }
  });

  const isMatch = await bcrypt.compare(code, otpRecord.code);

  if (!isMatch) {
    throw new AppError('Invalid verification code.', 400, 'OTP_INVALID');
  }

  if (!otpRecord.passwordHash) {
    throw new AppError('Verification payload is incomplete.', 400, 'OTP_NOT_FOUND');
  }

  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: {
      used: true
    }
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: otpRecord.passwordHash,
      name: otpRecord.name || email.split('@')[0],
      role: 'USER',
      isVerified: true,
      deletedAt: null
    },
    create: {
      email,
      passwordHash: otpRecord.passwordHash,
      name: otpRecord.name || email.split('@')[0],
      role: 'USER',
      isVerified: true
    }
  });

  const { accessToken, refreshToken } = generateTokenPair(user);

  return {
    user: getSafeUser(user),
    accessToken,
    refreshToken
  };
}

async function login(email, password) {
  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null
    }
  });

  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in.', 403, 'EMAIL_NOT_VERIFIED');
  }

  if (!user.passwordHash) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const { accessToken, refreshToken } = generateTokenPair(user);

  return {
    user: getSafeUser(user),
    accessToken,
    refreshToken
  };
}

async function resendOtp(email) {
  const existingVerifiedUser = await prisma.user.findFirst({
    where: {
      email,
      isVerified: true,
      deletedAt: null
    },
    select: { id: true }
  });

  if (existingVerifiedUser) {
    throw new AppError('An account already exists for this email.', 409, 'ALREADY_EXISTS');
  }

  const oneHourAgo = new Date(Date.now() - OTP_RESEND_WINDOW_MS);

  const recentUnusedCount = await prisma.otp.count({
    where: {
      email,
      purpose: 'EMAIL_VERIFY',
      used: false,
      createdAt: {
        gte: oneHourAgo
      }
    }
  });

  if (recentUnusedCount >= 3) {
    throw new AppError('Too many OTP requests. Please try again later.', 429, 'OTP_RATE_LIMIT');
  }

  const latestVerificationOtp = await prisma.otp.findFirst({
    where: {
      email,
      purpose: 'EMAIL_VERIFY'
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!latestVerificationOtp || !latestVerificationOtp.passwordHash) {
    throw new AppError('No pending verification request found for this email.', 400, 'OTP_NOT_FOUND');
  }

  await prisma.otp.updateMany({
    where: {
      email,
      purpose: 'EMAIL_VERIFY',
      used: false
    },
    data: {
      used: true
    }
  });

  const plainCode = generateOtpCode();
  const hashedCode = await bcrypt.hash(plainCode, 10);

  await prisma.otp.create({
    data: {
      email,
      code: hashedCode,
      purpose: 'EMAIL_VERIFY',
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      used: false,
      attempts: 0,
      passwordHash: latestVerificationOtp.passwordHash,
      name: latestVerificationOtp.name
    }
  });

  await sendOtpEmail(email, plainCode, latestVerificationOtp.name);

  return {
    message: 'New verification code sent.'
  };
}

async function refreshTokens(refreshToken) {
  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token has expired.', 401, 'TOKEN_EXPIRED');
    }

    throw new AppError('Invalid refresh token.', 401, 'TOKEN_INVALID');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId
    }
  });

  if (!user || user.deletedAt) {
    throw new AppError('Invalid refresh token.', 401, 'TOKEN_INVALID');
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email before continuing.', 403, 'EMAIL_NOT_VERIFIED');
  }

  const tokens = generateTokenPair(user);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      isVerified: true,
      createdAt: true,
      deletedAt: true
    }
  });

  if (!user || user.deletedAt) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    createdAt: user.createdAt
  };
}

module.exports = {
  register,
  verifyOtp,
  login,
  resendOtp,
  refreshTokens,
  getMe
};