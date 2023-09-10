import { frenchDictionary } from '$lib/server/game/french_words.server';
import { getCurrentGameOrCreateNew, getSolution, getStartOfDayInFranceAsUTC, getWordMatchingCount, processScore } from '$lib/server/game/game';
import { prisma } from '$lib/server/prisma';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { GameStatus, type GameAttempt, type Game } from '@prisma/client';

class GuessWordRequest {
	word: string;

	constructor(word: string) {
		this.word = word;
	}
}

function validatePayload(formattedWord: string, solutionWord: string): Response | null {
	if (!frenchDictionary.has(formattedWord)) {
		return new Response(JSON.stringify({ error: `The word ${formattedWord} does not exist in the provided dictionary.` }), { status: 400 });
	}
	if (solutionWord[0].toUpperCase() !== formattedWord[0]) {
		return new Response(JSON.stringify({ error: 'First letter does not match' }), { status: 400 });
	}
	if (solutionWord.length != formattedWord.length) {
		return new Response(JSON.stringify({ error: 'Word length does not match' }), { status: 400 });
	}

	return null;
}

async function updateGameWithAttempt(attempt: AttemptWithGame, currentGame: Game, today: Date) {
	const isWordSolution = attempt.score.split('').every((c: string) => c === 'x');

	let newState = attempt.game.state;
	let newStartTime = attempt.game.startTime;
	let newEndTime = attempt.game.endTime;
	if (isWordSolution) {
		newState = GameStatus.WON;
		newEndTime = today;
	} else if (attempt.game.state === GameStatus.NOT_STARTED) {
		newState = GameStatus.ONGOING;
		newStartTime = today;
	}

	return await prisma.game.update({
		where: {
			id: currentGame.id,
		},
		data: {
			attemptCount: (currentGame.attemptCount ?? 0) + 1,
			state: newState,
			startTime: newStartTime,
			endTime: newEndTime,
		},
		include: {
			attempts: true,
			user: true,
		},
	});
}

export const POST = async (requestEvent: RequestEvent): Promise<Response> => {
	const payload: GuessWordRequest = await requestEvent.request.json();

	// User and Session
	const session = await requestEvent.locals.getSession();
	const user = session?.user;
	if (!user?.id) {
		throw new Error('User Info Error');
	}

	// Initial Constant values
	const wordFormatted = payload.word.toUpperCase();
	const today = new Date();
	const FranceDate = getStartOfDayInFranceAsUTC(today);
	const solutionWord = await getSolution(today);

	// Validation
	const errorResponse = validatePayload(wordFormatted, solutionWord);
	if (null !== errorResponse) {
		return errorResponse;
	}

	const currentGame = await getCurrentGameOrCreateNew(user.id, FranceDate);

	const scoreForWord = processScore(solutionWord, wordFormatted);
	const matchingWordCount = getWordMatchingCount(wordFormatted, scoreForWord);

	const attemptCreated = await prisma.gameAttempt.create({
		data: {
			word: wordFormatted,
			score: scoreForWord,
			wordsMatching: matchingWordCount,
			gameId: currentGame.id,
		},
		include: {
			game: true,
		},
	});

	const result = await updateGameWithAttempt(attemptCreated, currentGame, today);

	return json({ game: result });
};
