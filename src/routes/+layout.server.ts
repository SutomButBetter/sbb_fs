import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const sessionData = await event.locals.getSession();
	return {
		session: sessionData,
	};
};
