import { PrismaClient } from '@prisma/client';

const prisma = global.devPrisma || new PrismaClient();

if (import.meta.env.MODE === 'development') {
	// used for development to store the prisma client to avoid creating a new connection on each svelte hot-reload
	global.devPrisma = prisma;
}

export { prisma };
