import { SBB_AUTH_SECRET, SBB_GOOGLE_CLIENT_ID, SBB_GOOGLE_SECRET } from '$env/static/private';
import { prisma } from '$lib/server/prisma';
import Google from '@auth/core/providers/google';
import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

export const handleAuthorization: Handle = async function ({ event, resolve }) {
	console.group('Routing');
	const session = await event.locals.getSession();
	if (event.url.pathname === '/game') {
		if (!session) {
			console.warn('not allowed to access restricted page:', event.url.pathname);
			console.groupEnd();
			throw redirect(303, '/auth');
		} else {
			console.debug('allowed to access restricted page:', event.url.pathname);
		}
	} else {
		console.debug('allowed to access page:', event.url.pathname);
	}

	// If the request is still here, just proceed as normally

	console.groupEnd();
	return resolve(event);
};

// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle = sequence(
	SvelteKitAuth({
		// @ts-ignore
		adapter: PrismaAdapter(prisma),
		providers: [
			Google({
				clientId: SBB_GOOGLE_CLIENT_ID,
				clientSecret: SBB_GOOGLE_SECRET,
			}),
		],
		secret: SBB_AUTH_SECRET,
		trustHost: true,
	}),
	handleAuthorization
) satisfies Handle;
