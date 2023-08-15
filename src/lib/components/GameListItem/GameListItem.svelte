<script lang="ts">
	import { onMount } from 'svelte';

	import { page } from '$app/stores';
	import { Prisma, type Game, GameStatus } from '@prisma/client';
	const gameWithUser = Prisma.validator<Prisma.GameDefaultArgs>()({
		include: { user: true },
	});
	type GameWithUser = Prisma.GameGetPayload<typeof gameWithUser>;

	export let game: GameWithUser;

	export const stateEmoji = new Map<GameStatus, string>([
		[GameStatus.NOT_STARTED, '🔘'],
		[GameStatus.ONGOING, '🟠'],
		[GameStatus.NOT_FINISHED, '⌛'],
		[GameStatus.WON, '🟢'],
		[GameStatus.LOST, '🔴'],
	]);

	let now = new Date();
	$: startTime = game.startTime;
	$: endTime = game.endTime ?? now;
	$: gameTime = !!startTime ? new Date(endTime.valueOf() - startTime.valueOf()) : null;

	onMount(() => {
		setInterval(() => {
			now = new Date();
		}, 1000);
	});
</script>

{stateEmoji.get(game.state) ?? '❔'} - {game.user.name} - {game.attemptCount} attempts ({gameTime?.toLocaleTimeString()})
