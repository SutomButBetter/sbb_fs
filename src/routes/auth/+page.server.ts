import { prisma } from '$lib/server/prisma';
import { Prisma } from '@prisma/client';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ cookies, locals, url }) => {
	const redirectUrl = url.searchParams.get('redirect');
	const session: Session = await locals.getSession();
	const isLoggedIn: boolean = !!session;

	if (isLoggedIn && redirectUrl) {
		throw redirect(303, redirectUrl);
	}

	let dbUser: User | null = null;
	const userInfo = {};
	if (isLoggedIn) {
		dbUser = await prisma.user.findUnique({
			where: {
				id: session.user.id,
			},
			include: {
				accounts: true,
				sessions: true,
			},
		});
	}
	const accounts = [];
	if (dbUser) {
		userInfo.email = dbUser.email;
		userInfo.name = dbUser.name;
		userInfo.id = dbUser.id;
		for (const account of dbUser.accounts) {
			accounts.push({
				provider: account.provider,
			});
		}
	}
	return {
		isLoggedIn: isLoggedIn,
		user: userInfo,
		accounts: accounts,
	};
}) satisfies PageServerLoad;
