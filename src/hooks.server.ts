import { SBB_AUTH_SECRET, SBB_GOOGLE_CLIENT_ID, SBB_GOOGLE_SECRET, VITE_SENTRY_DSN } from '$env/static/private';
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
	dsn: VITE_SENTRY_DSN,
	tracesSampleRate: 1,
	profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
	release: sbb_release,
	environment: import.meta.env.MODE,
	//@ts-ignore
	integrations: [new ProfilingIntegration()],
});

export const handleAuthorization: Handle = async function ({ event, resolve }) {
	const path = event.url.pathname;
	const session = await event.locals.getSession();
	if (path === '/game') {
		if (!session) {
			const redirectUrl = `/auth?redirect=${path}`;
			console.warn('not allowed to access restricted page:', path, 'redirect to:', redirectUrl);
			throw redirect(302, redirectUrl);
		} else {
			console.debug('allowed to access restricted page:', path);
		}
	} else {
		console.debug('allowed to access page:', path);
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
