import { frenchWordList } from "../routes/french_words.server";

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

		if (scoreChar === "x" && guessChar !== wordChar) {
			return false;
		} else if (scoreChar === "c" && (guessChar === wordChar || !word.includes(guessChar))) {
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
