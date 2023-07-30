import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Game } from './game';
import { GameDifficultyConfig, attempsAllowedCount, gameConfigCookieName, gameDataCookieName } from './game_config';

export const load = (async ({ cookies }) => {
	const gameConfigCookieRawContent = cookies.get(gameConfigCookieName);
	const config = new GameDifficultyConfig(gameConfigCookieRawContent);
	cookies.set(gameConfigCookieName, config.toString());

	const gameDataCookieRawContent = cookies.get(gameDataCookieName);
	const game = new Game(gameDataCookieRawContent);
	await game.init();
	cookies.set(gameDataCookieName, game.toString());

	return {
		/**
		 * The player's guessed words so far
		 */
		guesses: game.guesses,

		/**
		 * An array of strings like '__x_c' corresponding to the guesses, where 'x' means
		 * an exact match, and 'c' means a close match (right letter, wrong place)
		 */
		answers: game.answers,

		/**
		 * number of word in the french dictionnary matching the response
		 */
		possibilities: game.possibilities,

		/**
		 * The correct answer, revealed if the game is over
		 */
		answer: game.answers.length >= attempsAllowedCount ? game.solution : null,

		/**
		 * Length of the word to find
		 */
		answerLength: game.solution.length,

		firstLetter: !!config.revealFirstLetter ? game.solution[0] : null
	};
}) satisfies PageServerLoad;

export const actions = {
	/**
	 * Modify game state in reaction to a keypress. If client-side JavaScript
	 * is available, this will happen in the browser instead of here
	 */
	update: async ({ request, cookies }) => {
		const game = new Game(cookies.get(gameDataCookieName));
		game.init();
		const data = await request.formData();
		const key = data.get('key');

		const i = game.answers.length;

		if (key === 'backspace') {
			game.guesses[i] = game.guesses[i].slice(0, -1);
		} else {
			game.guesses[i] += key;
		}

		cookies.set(gameDataCookieName, game.toString());
	},

	/**
	 * Modify game state in reaction to a guessed word. This logic always runs on
	 * the server, so that people can't cheat by peeking at the JavaScript
	 */
	enter: async ({ request, cookies }) => {
		const game = new Game(cookies.get(gameDataCookieName));
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
	}
} satisfies Actions;
