const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const rateLimit = require('express-rate-limit');
const xss = require('xss');

const logger = require('@utils/logger');

const SKIP_SANITIZE_KEYS = new Set(['password', 'passwordHash', 'otp', 'code', 'token']);

function rateLimitExceededHandler(req, res) {
  res.status(429).json({
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.'
  });
}

function applySecurityMiddleware(app) {
  app.use(
    pinoHttp({
      logger,
      customProps(req, res) {
        return {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode
        };
      }
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          mediaSrc: ["'self'", 'https://res.cloudinary.com'],
          connectSrc: ["'self'", 'https://api.cloudinary.com'],
          fontSrc: ["'self'", 'data:'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"]
        }
      }
    })
  );

  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  app.use(
    '/api/v1/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      handler: rateLimitExceededHandler
    })
  );

  app.use(
    '/api/v1/payments',
    rateLimit({
      windowMs: 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      handler: rateLimitExceededHandler
    })
  );

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      handler: rateLimitExceededHandler
    })
  );
}

function sanitizeBodyValue(value, keyName) {
  if (keyName && SKIP_SANITIZE_KEYS.has(keyName)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeBodyValue(item, keyName));
  }

  if (value && typeof value === 'object') {
    const sanitizedObject = {};

    Object.keys(value).forEach((key) => {
      sanitizedObject[key] = sanitizeBodyValue(value[key], key);
    });

    return sanitizedObject;
  }

  if (typeof value === 'string') {
    return xss(value);
  }

  return value;
}

function xssSanitizer(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeBodyValue(req.body);
  }

  next();
}

module.exports = {
  applySecurityMiddleware,
  xssSanitizer
};