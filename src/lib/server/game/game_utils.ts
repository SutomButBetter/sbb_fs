import { frenchWordList } from './french_words.server';

export function doesWordMatchScore(word: string, guess: string, score: string): boolean {
	if (!guess || !score) {
		return false;
	}

	if (word.length !== guess.length) {
		return false;
	}

	for (let i = 0; i < score.length; i++) {
		const scoreChar = score.charAt(i);
		const guessChar = guess.charAt(i);
		const wordChar = word.charAt(i);

		if (scoreChar === 'x' && guessChar !== wordChar) {
			return false;
		} else if (scoreChar === 'c' && (guessChar === wordChar || !word.includes(guessChar))) {
			return false;
		}
	}
	return true;
}

export function getWordMatchingCount(guess: string, score: string): number {
	return frenchWordList.reduce((accumulator, currentValue) => {
		if (doesWordMatchScore(currentValue, guess, score)) {
			accumulator = accumulator + 1;
		}
		return accumulator;
	}, 0);
}

export function processScore(solution: string, propositionWord: string): string {
	const letters = propositionWord.split('');
	const available = Array.from(solution.toUpperCase());
	const answer = Array(solution.length).fill('_');

	// first, find exact matches
	for (let i = 0; i < solution.length; i += 1) {
		if (letters[i] === available[i]) {
			answer[i] = 'x';
			available[i] = ' ';
		}
	}

	// then find close matches (this has to happen
	// in a second step, otherwise an early close
	// match can prevent a later exact match)
	for (let i = 0; i < solution.length; i += 1) {
		if (answer[i] === '_') {
			const index = available.indexOf(letters[i]);
			if (index !== -1) {
				answer[i] = 'c';
				available[index] = ' ';
			}
		}
	}
	return answer.join('');
}