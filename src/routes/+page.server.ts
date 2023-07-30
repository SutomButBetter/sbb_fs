import { redirect } from '@sveltejs/kit';

export function load() {
	console.debug('redirect from root to game page');
	throw redirect(302, '/game');
}
