import { getCurrentGameOrCreateNew, getSolution, getStartOfDayInFranceAsUTC } from '$lib/server/game/game';
import type { Actions, PageServerLoad } from './$types';
import { GameDifficultyConfig, attemptsAllowedCount, gameConfigCookieName } from './game_config';

export const load = (async ({ cookies, locals }) => {
	const gameConfigCookieRawContent = cookies.get(gameConfigCookieName);
	const config = new GameDifficultyConfig(gameConfigCookieRawContent);
	cookies.set(gameConfigCookieName, config.toString());

	const session = await locals.getSession();
	const user = session?.user;
	if (!user?.id) {
		throw new Error('User Info Error');
	}
	const FranceDate = getStartOfDayInFranceAsUTC(null);

	const currentGame = await getCurrentGameOrCreateNew(user.id, FranceDate);
	const today = new Date();
	const solutionWord = await getSolution(today);

	return {
		game: currentGame,

		/**
		 * The correct answer, revealed if the game is over
		 */
		solution: currentGame.attemptCount ?? 0 >= attemptsAllowedCount ? solutionWord : null,

		/**
		 * Length of the word to find
		 */
		answerLength: solutionWord.length,

		firstLetter: config.revealFirstLetter ? solutionWord[0] : null,
	};
}) satisfies PageServerLoad;

export const actions = {} satisfies Actions;
