const { PrismaClient } = require('@prisma/client');

const prismaLog = process.env.NODE_ENV === 'development'
  ? ['query', 'info', 'warn', 'error']
  : ['error'];

if (!global.__learnhubPrisma) {
  global.__learnhubPrisma = new PrismaClient({ log: prismaLog });
}

const prisma = global.__learnhubPrisma;

module.exports = {
  prisma
};