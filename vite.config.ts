import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'sutombutbetter',
				project: 'sbb_svelte',
				authToken: process.env.SENTRY_AUTH_TOKEN,
				release: `sutom-but-better@${process.env.npm_package_version ?? 'unnamed'}`, //sbb_release
				telemetry: false,
				dryRun: process.env.NODE_ENV !== 'production',
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
	resolve: {
		alias: {
			// HACK to fix a problem with vite and javascript enums (https://github.com/prisma/prisma/issues/12504#issuecomment-1285883083)
			'.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
		},
	},
});
