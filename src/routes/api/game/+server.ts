import { Prisma } from '@prisma/client';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { getNocleSutomSolution } from '$lib/server/nocle/nocle_interface';
import {
	getCurrentGame,
	getCurrentGameOrCreateNew,
	getStartOfDayInFranceAsUTC,
	getWordMatchingCount,
	processScore,
} from '$lib/server/game/game_utils';

class GuessWordRequest {
	word: string;

	constructor(word: string) {
		this.word = word;
	}
}

export const POST = async (requestEvent: RequestEvent) => {
	const payload: GuessWordRequest = await requestEvent.request.json();

	const session = await requestEvent.locals.getSession();
	const user = session?.user;
	if (!user?.id) {
		throw new Error('User Info Error');
	}

	const today = new Date();
	const FranceDate = getStartOfDayInFranceAsUTC();

	// TODO : create a game solution record in the database to avoid spamming their api
	const solutionWord = await getNocleSutomSolution(today);

	// TODO : merge all checks
	if (solutionWord[0].toUpperCase() !== payload.word[0].toUpperCase()) {
		return new Response(JSON.stringify({ error: 'First letter does not match' }), { status: 400 });
	}
	if (solutionWord.length != payload.word.length) {
		return new Response(JSON.stringify({ error: 'Word length does not match' }), { status: 400 });
	}

	const currentGame = await getCurrentGameOrCreateNew(user.id, FranceDate);

	const scoreForWord = processScore(solutionWord, payload.word);
	const matchingWordCount = getWordMatchingCount(payload.word, scoreForWord);

	const attempCreated = await prisma.gameAttempt.create({
		data: {
			word: payload.word,
			score: scoreForWord,
			wordsMatching: matchingWordCount,
			gameId: currentGame.id,
		},
	});

	const result = await prisma.game.update({
		where: {
			id: currentGame.id,
		},
		data: {
			attemptCount: currentGame.attemptCount ?? 0 + 1,
			won: scoreForWord.split('').every((c) => c === 'x'),
		},
		include: {
			attempts: true,
			user: true,
		},
	});

	return json({ game: result });
};
