import { getCurrentGameOrCreateNew, getSolution, getStartOfDayInFranceAsUTC } from '$lib/server/game/game_utils';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CookieGame } from './game';
import { GameDifficultyConfig, attemptsAllowedCount, gameConfigCookieName, gameDataCookieName } from './game_config';

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

export const actions = {
	// /**
	//  * Modify game state in reaction to a keypress. If client-side JavaScript
	//  * is available, this will happen in the browser instead of here
	//  */
	// update: async ({ request, cookies }) => {
	// 	const game = new Game(cookies.get(gameDataCookieName));
	// 	game.init();
	// 	const data = await request.formData();
	// 	const key = data.get('key');

	// 	const i = game.answers.length;

	// 	if (key === 'backspace') {
	// 		game.guesses[i] = game.guesses[i].slice(0, -1);
	// 	} else {
	// 		game.guesses[i] += key;
	// 	}

	// 	cookies.set(gameDataCookieName, game.toString());
	// },

	/**
	 * Modify game state in reaction to a guessed word. This logic always runs on
	 * the server, so that people can't cheat by peeking at the JavaScript
	 */
	enter: async ({ request, cookies }) => {
		const game = new CookieGame(cookies.get(gameDataCookieName));
		game.init();

		const data = await request.formData();
		const guess = data.getAll('guess') as string[];

		if (!game.enter(guess)) {
			return fail(400, { badGuess: true });
		}

		cookies.set(gameDataCookieName, game.toString());
	},

	restart: async ({ cookies }) => {
		cookies.delete(gameDataCookieName);
	},
} satisfies Actions;
