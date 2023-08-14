import { SBB_AUTH_SECRET, SBB_GOOGLE_CLIENT_ID, SBB_GOOGLE_SECRET } from '$env/static/private';
import { sbb_release } from '$lib/config';
import { prisma } from '$lib/server/prisma';
import Google from '@auth/core/providers/google';
import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import * as Sentry from '@sentry/sveltekit';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
	dsn: process.env.VITE_SENTRY_DSN,
	tracesSampleRate: 1,
	profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
	release: sbb_release,
	environment: import.meta.env.MODE,
	integrations: [new ProfilingIntegration()],
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

export const handleError = Sentry.handleErrorWithSentry();
