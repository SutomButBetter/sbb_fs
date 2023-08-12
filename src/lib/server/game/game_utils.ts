import { Prisma } from '@prisma/client';
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

/**
 * Returns the start of the current day in France as a UTC date.
 *
 * This function calculates the start of the day in the user's local time zone,
 * converts it to the corresponding UTC date, and then sets the hours, minutes,
 * seconds, and milliseconds to 0, effectively getting the start of the day in the UTC time zone.
 *
 * @returns {Date} The start of the current day in France as a UTC Date object.
 *
 * @author ChatGPT
 * @license MIT
 */
export function getStartOfDayInFranceAsUTC() {
	// Get the current date and time in the user's local time zone
	const currentDate = new Date();

	// Get the time zone offset between the local time and UTC time in minutes
	const timeZoneOffsetInMinutes = currentDate.getTimezoneOffset();

	// Convert the local date to the corresponding UTC date by subtracting the offset
	const utcDate = new Date(currentDate.getTime() - timeZoneOffsetInMinutes * 60 * 1000);

	// Set the time to the beginning of the day in the UTC time zone (00:00:00)
	utcDate.setUTCHours(0, 0, 0, 0);

	return utcDate;
}

export async function getCurrentGame(userId: string, date: Date) {
	const currentGame = await prisma.game.findFirst({
		where: {
			date: {
				equals: date,
			},
			userId: {
				equals: userId,
			},
		},
	});

	return currentGame;
}

export async function getCurrentGameOrCreateNew(userId: string, date: Date): Promise<GameWithAttempts> {
	return prisma.game.upsert({
		where: {
			userId_date: {
				date: date,
				userId: userId,
			},
		},
		update: {},
		create: {
			userId: userId,
			date: date,
		},
		include: {
			attempts: true
		}
	});
}


// 1: Define a type that includes the relation to `Post`
const gameWithAttempts = Prisma.validator<Prisma.GameDefaultArgs>()({
	include: { attempts: true },
})

// 3: This type will include a user and all their posts
type GameWithAttempts = Prisma.GameGetPayload<typeof gameWithAttempts>