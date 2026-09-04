import { PrismaClient } from '@prisma/client';

// Singleton Prisma Client — import this everywhere, never instantiate a new
// PrismaClient elsewhere (it exhausts DB connections in dev with hot reload).
const prisma = new PrismaClient();

export default prisma;
