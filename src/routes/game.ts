import {frenchDictionary, frenchWordList, frenchWordsCount} from './french_words.server';

export class Game {
	index: number;
	guesses: string[]; // words guessed by the player
	answers: string[]; // score associated with each guess
	solution: string;

	/**
	 * Create a game object from the player's cookie, or initialise a new game
	 */
	constructor(serialized: string | undefined = undefined) {
		if (serialized) {
			const [index, guesses, answers] = serialized.split('-');

			this.index = +index;
			this.guesses = guesses ? guesses.split(' ') : [];
			this.answers = answers ? answers.split(' ') : [];
			console.debug("game loaded")
		} else {
			this.index = Math.floor(Math.random() * frenchWordsCount);
			this.guesses = ['', '', '', '', '', ''];
			this.answers = [];
			console.debug("game initialized")

		}

		this.solution = frenchWordList[this.index];
		console.debug("solution is :", this.solution)
	}

	/**
	 * Update game state based on a guess of a five-letter word. Returns
	 * true if the guess was valid, false otherwise
	 */
	enter(letters: string[]) {
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
		return `${this.index}-${this.guesses.join(' ')}-${this.answers.join(' ')}`;
	}
}
