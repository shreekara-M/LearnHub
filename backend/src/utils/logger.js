const pino = require('pino');

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'otp',
      'code',
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.otp',
      '*.code',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]'
    ],
    censor: '[REDACTED]'
  },
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard'
        }
      }
    : undefined
});

module.exports = logger;