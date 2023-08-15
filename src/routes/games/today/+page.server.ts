import { getCurrentGameOrCreateNew, getSolution, getStartOfDayInFranceAsUTC } from '$lib/server/game/game';
import { prisma } from '$lib/server/prisma';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies, locals }) => {
	const today = getStartOfDayInFranceAsUTC(null);
	const games = await prisma.game.findMany({
		where: {
			date: today,
		},
		include: { user: true },
	});
	return {
		games: games,
	};
}) satisfies PageServerLoad;
