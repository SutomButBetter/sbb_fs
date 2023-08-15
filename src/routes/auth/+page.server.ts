import { prisma } from '$lib/server/prisma';
import { Prisma } from '@prisma/client';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Session, User } from '@auth/core/types';

const userWithAccounts = Prisma.validator<Prisma.UserDefaultArgs>()({
	include: { accounts: true, sessions: true },
});
type UserWithAccounts = Prisma.UserGetPayload<typeof userWithAccounts>;

export const load = (async ({ locals, url }) => {
	const redirectUrl = url.searchParams.get('redirect');
	const session = await locals.getSession();
	const isLoggedIn: boolean = !!session;

	if (session && redirectUrl) {
		console.info('user is logged in redirect requested, redirect to:', redirectUrl);
		throw redirect(302, redirectUrl);
	}

	let dbUser: UserWithAccounts | null = null;
	const userInfo: any = {};
	if (session) {
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
