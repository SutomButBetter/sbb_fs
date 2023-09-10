<script lang="ts">
	import GameListItem from '$lib/components/GameListItem/GameListItem.svelte';
	import type { PageData } from './$types';
	import { GameStatus } from '@prisma/client';

	export let data: PageData;

	export const stateEmoji = new Map<GameStatus, string>([
		[GameStatus.NOT_STARTED, '🔘'],
		[GameStatus.ONGOING, '🟠'],
		[GameStatus.NOT_FINISHED, '⌛'],
		[GameStatus.WON, '🟢'],
		[GameStatus.LOST, '🔴'],
	]);
</script>

<svelte:head>
	<title>Sutom : today's game</title>
	<meta name="description" content="Sutom But Better" />
</svelte:head>

games for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
<ul>
	{#each data.games as game}
		<li>
			<GameListItem {game} />
		</li>
	{/each}
</ul>
