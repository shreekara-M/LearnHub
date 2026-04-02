require('module-alias/register');
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');

const { validateEnv } = require('./config');
const routes = require('@routes/index');
const { prisma } = require('@lib/prisma');
const logger = require('@utils/logger');
const { applySecurityMiddleware, xssSanitizer } = require('@middleware/securityMiddleware');
const { notFound } = require('@middleware/notFound');
const { errorHandler } = require('@middleware/errorHandler');

validateEnv();

const app = express();

applySecurityMiddleware(app);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(xssSanitizer);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'LearnHub backend server started');
});

let shuttingDown = false;

function shutdown(signal, reason) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.warn({ signal, reason }, 'Shutdown initiated');

  const forceExitTimer = setTimeout(async () => {
    logger.error('Forced shutdown after timeout');
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      logger.error({ err: disconnectError }, 'Failed to disconnect Prisma during forced shutdown');
    }
    process.exit(1);
  }, 10000);

  server.close(async (closeError) => {
    clearTimeout(forceExitTimer);

    if (closeError) {
      logger.error({ err: closeError }, 'Error while closing server');
      process.exit(1);
      return;
    }

    try {
      await prisma.$disconnect();
      logger.info('Server closed gracefully');
      process.exit(0);
    } catch (disconnectError) {
      logger.error({ err: disconnectError }, 'Error while disconnecting Prisma');
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled rejection detected');
  shutdown('UNHANDLED_REJECTION', reason);
});