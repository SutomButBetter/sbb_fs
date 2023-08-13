import { PrismaClient } from '@prisma/client';

/**
 * builds prisma client
 * 
 * @returns prisma client
 */
function getPrisma() {
	console.group("PRISMA")

	let prismaClient = null;
	if (!global.prisma) {
		prismaClient = new PrismaClient();
		console.debug("Generated new Prisma Client")
		if (process.env.NODE_ENV === 'development') {
			// used for development to store the prisma client to avoid creating a new connection on each svelte hot-reload
			console.debug("DEV: stored prisma client to global variable")
			global.prisma = prismaClient;
		}
	} else {
		prismaClient = global.prisma;
		console.debug("DEV: Loaded Prisma Client from global var")
	}

	console.groupEnd()
	return prismaClient;
}

const prisma = getPrisma();
export { prisma };
