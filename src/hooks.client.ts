import * as Sentry from '@sentry/sveltekit';
import { handleErrorWithSentry, Replay } from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://373b203dbf91fe30522b24c878b1ec74@o4505698694397952.ingest.sentry.io/4505698696888320',
	tracesSampleRate: 1.0,

	// This sets the sample rate to be 10%. You may want this to be 100% while
	// in development and sample at a lower rate in production
	replaysSessionSampleRate: 0.1,

	// If the entire session is not sampled, use the below sample rate to sample
	// sessions when an error occurs.
	replaysOnErrorSampleRate: 1.0,

	// If you don't want to use Session Replay, just remove the line below:
	integrations: [new Replay()],

	release: "sutom-but-better@" + process.env.npm_package_version,
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
