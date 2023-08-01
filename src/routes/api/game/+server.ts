import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

class GuessWordRequest {
	message: string | null = null;
	word: string;

	constructor(word: string) {
		this.word = word;
	}
}

export const POST = async (requestEvent: RequestEvent) => {
	const payload: GuessWordRequest = await requestEvent.request.json();

	return json({ status: 'ok' });
};
