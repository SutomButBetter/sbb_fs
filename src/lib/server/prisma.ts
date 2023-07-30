import { PrismaClient } from "@prisma/client";

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") {
	// used for development to store the prisma client to avoid creating a new connection on each svelte hot-reload
	global.prisma = prisma;
}

export { prisma }