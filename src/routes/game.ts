import { getNocleSutomWord } from '$lib/server/nocle_sutom';
import { frenchDictionary, frenchWordList, frenchWordsCount } from './french_words.server';

export class Game {
	guesses: string[]; // words guessed by the player
	answers: string[]; // score associated with each guess
	solutionIndex: number|undefined;
	solution: string = "";

	/**
	 * Create a game object from the player's cookie, or initialise a new game
	 */
	constructor(serialized: string | undefined = undefined) {
		console.group("Game loading");
		if (serialized) {
			console.debug("loading from cookie")
			const [index, guesses, answers] = serialized.split('-');

			this.solutionIndex = +index;
			this.guesses = guesses ? guesses.split(' ') : [];
			this.answers = answers ? answers.split(' ') : [];
			this.solution = frenchWordList[this.solutionIndex];
			console.debug("solution (loaded) is :", this.solution);
		} else {
			console.debug("generating new game data")

			this.guesses = ['', '', '', '', '', ''];
			this.answers = [];
			console.debug("game partially initialized, no solution yet")
		}

		console.groupEnd();
	}

	async init() {
		if (this.isInit()) {
			console.debug("already initialized")
			return;
		}

		let nocleSolution = await getNocleSutomWord(new Date());

		if (nocleSolution) {
			this.solutionIndex = frenchWordList.findIndex(e => e === nocleSolution);

			this.solution = nocleSolution; 
			console.debug("solution is :", this.solution);
			console.debug("game initialized")
		}
	}

	isInit() : boolean{
		return !!this.solutionIndex;
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

		if (!valid) {
			console.debug(`The word ${word} does not exist in the provided dictionnary.`)
			return false
		};

		this.guesses[this.answers.length] = word;

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

		return true;
	}

	/**
	 * Serialize game state so it can be set as a cookie
	 */
	toString() {
		return `${this.solutionIndex}-${this.guesses.join(' ')}-${this.answers.join(' ')}`;
	}
}
