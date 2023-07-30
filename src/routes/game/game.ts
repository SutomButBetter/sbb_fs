import { doesWordMatchScore, getWordMatchingCount } from '$lib/game/game_utils';
import { getNocleSutomWord } from '$lib/server/nocle/nocle_interface';
import { frenchDictionary, frenchWordList, frenchWordsCount } from '../../lib/game/french_words.server';
import { attempsAllowedCount } from './game_config';
import type { words } from '../../lib/game/words.server';

export class Game {
	guesses: string[]; // words guessed by the player
	answers: string[]; // score associated with each guess
	solutionIndex: number | undefined;
	solution: string = '';
	possibilities: number[];

	/**
	 * Create a game object from the player's cookie, or initialise a new game
	 */
	constructor(serialized: string | undefined = undefined) {
		console.group('Game loading');
		if (serialized) {
			console.debug('loading from cookie');
			const [index, guesses, answers, possibilities] = serialized.split('-');

			this.solutionIndex = +index;
			this.guesses = guesses ? guesses.split(' ') : [];
			this.answers = answers ? answers.split(' ') : [];
			this.possibilities = possibilities ? possibilities.split(' ').map((str) => +str) : [];
			this.solution = frenchWordList[this.solutionIndex];
			console.debug('solution is loaded:', !!this.solution);
		} else {
			console.debug('generating new game data');

			this.guesses = ['', '', '', '', '', ''];
			this.answers = [];
			this.possibilities = [];
			console.debug('game partially initialized, no solution yet');
		}

		console.groupEnd();
	}

	async init() {
		if (this.isInit()) {
			console.debug('already initialized');
			return;
		}

		let nocleSolution = await getNocleSutomWord(new Date());

		if (nocleSolution) {
			this.solutionIndex = frenchWordList.findIndex((e) => e === nocleSolution);

			this.solution = nocleSolution;
			console.debug('solution loaded from nocle:', !!this.solution);
			console.debug('game initialized');
		}

		if (this.guesses) {
			for (let index = 0; index < this.guesses.length; index++) {
				const guess = this.guesses[index];
				const score = this.answers[index];

				const matchingWordsCount = getWordMatchingCount(guess, score);
				this.possibilities[index] = matchingWordsCount;
			}
		}
	}

	isInit(): boolean {
		return !!this.solutionIndex && !!this.possibilities;
	}

	/**
	 * Update game state based on a guess of a word. Returns
	 * true if the guess was valid, false otherwise
	 */
	enter(letters: string[]) {
		if (!this.isInit()) {
			return false;
		}
		const word = letters.join('');
		const wordFormatted = word.toUpperCase();
		const valid = frenchDictionary.has(wordFormatted);
		const answerIndex = this.answers.length;

		if (!valid) {
			console.debug(`The word ${word} does not exist in the provided dictionnary.`);
			return false;
		}

		this.guesses[answerIndex] = word;

		const available = Array.from(this.solution.toUpperCase());
		const answer = Array(this.solution.length).fill('_');

		// first, find exact matches
		for (let i = 0; i < this.solution.length; i += 1) {
			if (letters[i] === available[i]) {
				answer[i] = 'x';
				available[i] = ' ';
			}
		}

		// then find close matches (this has to happen
		// in a second step, otherwise an early close
		// match can prevent a later exact match)
		for (let i = 0; i < this.solution.length; i += 1) {
			if (answer[i] === '_') {
				const index = available.indexOf(letters[i]);
				if (index !== -1) {
					answer[i] = 'c';
					available[index] = ' ';
				}
			}
		}

		this.answers.push(answer.join(''));

		const matchingWordsCount = getWordMatchingCount(word, answer.join(''));
		this.possibilities[answerIndex] = matchingWordsCount;

		return true;
	}

	/**
	 * Serialize game state so it can be set as a cookie
	 */
	toString() {
		return `${this.solutionIndex}-${this.guesses.join(' ')}-${this.answers.join(' ')}-${this.possibilities.join(' ')}`;
	}
}
