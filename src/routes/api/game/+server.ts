import { frenchDictionary } from '$lib/server/game/french_words.server';
import { getCurrentGameOrCreateNew, getSolution, getStartOfDayInFranceAsUTC, getWordMatchingCount, processScore } from '$lib/server/game/game';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

class GuessWordRequest {
	word: string;

	constructor(word: string) {
		this.word = word;
	}
}

export const POST = async (requestEvent: RequestEvent): Promise<Response> => {
	const payload: GuessWordRequest = await requestEvent.request.json();
	const wordFormatted = payload.word.toUpperCase();

	const session = await requestEvent.locals.getSession();
	const user = session?.user;
	if (!user?.id) {
		throw new Error('User Info Error');
	}

	const today = new Date();
	const FranceDate = getStartOfDayInFranceAsUTC(today);

	const solutionWord = await getSolution(today);

	// TODO : merge all checks
	if (!frenchDictionary.has(wordFormatted)) {
		return new Response(JSON.stringify({ error: `The word ${wordFormatted} does not exist in the provided dictionary.` }), { status: 400 });
	}
	if (solutionWord[0].toUpperCase() !== wordFormatted[0]) {
		return new Response(JSON.stringify({ error: 'First letter does not match' }), { status: 400 });
	}
	if (solutionWord.length != wordFormatted.length) {
		return new Response(JSON.stringify({ error: 'Word length does not match' }), { status: 400 });
	}

	const currentGame = await getCurrentGameOrCreateNew(user.id, FranceDate);

	const scoreForWord = processScore(solutionWord, wordFormatted);
	const matchingWordCount = getWordMatchingCount(wordFormatted, scoreForWord);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const attemptCreated = await prisma.gameAttempt.create({
		data: {
			word: wordFormatted,
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
			attemptCount: (currentGame.attemptCount ?? 0) + 1,
			won: scoreForWord.split('').every((c) => c === 'x'),
		},
		include: {
			attempts: true,
			user: true,
		},
	});

	return json({ game: result });
};
