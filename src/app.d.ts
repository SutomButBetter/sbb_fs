// See https://kit.svelte.dev/docs/types#app

import type { PrismaClient } from '@prisma/client';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	// eslint-disable-next-line no-var
	var devPrisma: PrismaClient; // used for development to store the prisma client to avoid creating a new connection on each svelte hot-reload
}

export {};
