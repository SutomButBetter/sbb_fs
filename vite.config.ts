import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'sutombutbetter',
				project: 'javascript-sveltekit',
				authToken: process.env.SENTRY_AUTH_TOKEN,
			},
		}),
		sveltekit(),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
	define: {
		SBB_VERSION: JSON.stringify(process.env.npm_package_version),
		SBB_APP_NAME: JSON.stringify('sutom-but-better'),
	},
});
