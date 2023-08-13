import { getWordMatchingCount, processScore } from '$lib/server/game/game_utils';
import { getNocleSutomSolution } from '$lib/server/nocle/nocle_interface';
import { frenchDictionary, frenchWordList } from '../../lib/server/game/french_words.server';

export class CookieGame {
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

		const nocleSolution = await getNocleSutomSolution(new Date());

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

		const score = processScore(this.solution, word);

		this.answers.push(score);
		const matchingWordsCount = getWordMatchingCount(word, score);
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
