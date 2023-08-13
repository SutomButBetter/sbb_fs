import { SBB_AUTH_SECRET, SBB_GOOGLE_CLIENT_ID, SBB_GOOGLE_SECRET } from '$env/static/private';
import { prisma } from '$lib/server/prisma';
import Google from '@auth/core/providers/google';
import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import * as Sentry from '@sentry/sveltekit';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

Sentry.init({
	dsn: 'https://373b203dbf91fe30522b24c878b1ec74@o4505698694397952.ingest.sentry.io/4505698696888320',
	tracesSampleRate: 1,
	release: "sutom-but-better@" + process.env.npm_package_version,
});

export const handleAuthorization: Handle = async function ({ event, resolve }) {
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
	return resolve(event);
};

// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle = sequence(
	Sentry.sentryHandle(),
	sequence(
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
			callbacks: {
				session: async ({ session, user }) => {
					if (session?.user) {
						session.user.id = user.id;
					}

					return session;
				},
				jwt: async ({ user, token }) => {
					if (user) {
						token.uid = user.id;
					}
					return token;
				},
			},
		}),
		handleAuthorization
	) satisfies Handle
);

console.debug('START node env', process.env.NODE_ENV);
export const handleError = Sentry.handleErrorWithSentry();
