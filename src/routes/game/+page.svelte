<script lang="ts">
	import { confetti } from '@neoconfetti/svelte';
	import { GameStatus, type GameAttempt } from '@prisma/client';
	import type { PageData } from './$types';
	import { attemptsAllowedCount } from './game_config';
	import { reduced_motion } from './reduced-motion';

	export let data: PageData;
	export let currentAttempt: string = data.firstLetter ?? '';

	const gameOverStatuses: GameStatus[] = [GameStatus.WON, GameStatus.LOST, GameStatus.NOT_FINISHED];
	$: gameOver = gameOverStatuses.includes(game.state as GameStatus);

	/** The index of the current guess */
	$: currentRowIndex = gameOver ? -1 : game.attemptCount ?? 0;

	/** Whether the current guess can be submitted */
	$: submittable = currentAttempt.length === data.answerLength && !badGuess;

	$: won = game.state === GameStatus.WON;

	$: loadingGame = false;

	$: game = data.game;

	$: badGuess = false;

	/**
	 * A map of classnames for all letters that have been guessed,
	 * used for styling the keyboard
	 */
	let classnames: Record<string, 'exact' | 'close' | 'missing'>;

	/**
	 * A map of descriptions for all letters that have been guessed,
	 * used for adding text for assistive technology (e.g. screen readers)
	 */
	let description: Record<string, string>;

	$: {
		classnames = {};
		description = {};

		if (!!data.firstLetter) {
			classnames[data.firstLetter] = 'exact';
			description[data.firstLetter] = 'correct';
		}

		game.attempts.forEach((attempt: GameAttempt) => {
			const attemptWord = attempt.word;
			const attemptScore = attempt.score;

			for (let i = 0; i < attemptWord.length; i++) {
				const letter = attemptWord[i];
				const score = attemptScore[i]

				if (score === 'x') {
					classnames[letter] = 'exact';
					description[letter] = 'correct';
				} else if (!classnames[letter]) {
					classnames[letter] = score === 'c' ? 'close' : 'missing';
					description[letter] = score === 'c' ? 'present' : 'absent';
				}
			}
		});
	}

	/**
	 * Modify the game state without making a trip to the server,
	 * if client-side JavaScript is enabled
	 */
	function update(event: MouseEvent) {
		const key = (event.target as HTMLButtonElement).getAttribute('data-key');

		if (key === 'backspace') {
			if (!!data.firstLetter && currentAttempt.length > 1) {
				currentAttempt = currentAttempt.slice(0, -1);
			}
			if (badGuess) badGuess = false;
		} else if (currentAttempt.length < data.answerLength) {
			currentAttempt += key;
		}
	}

	/**
	 * Trigger form logic in response to a keydown event, so that
	 * desktop users can use the keyboard to play the game
	 */
	function keydown(event: KeyboardEvent) {
		// ignore the event if a modifier is pressed
		if (event.metaKey || event.altKey || event.ctrlKey) return;

		document.querySelector(`[data-key="${event.key}" i]`)?.dispatchEvent(new MouseEvent('click', { cancelable: true }));
	}

	async function submitAttempt(event: Event) {
		event.preventDefault();
		loadingGame = true;

		const formData = new FormData(event.target as HTMLFormElement);
		try {
			const response = await fetch('/api/game', {
				headers: { accept: 'application/json' },
				method: 'POST',
				body: JSON.stringify({ word: formData.getAll('guess').join('') }),
			});

			if (response.ok) {
				const responseData = await response.json();
				game = responseData.game;
				currentAttempt = data.firstLetter ?? '';
			} else {
				badGuess = true;
				console.error('Error (not ok):', response.statusText);
			}
		} catch (error: any) {
			console.error('Error (catch):', error.message);
		} finally {
			loadingGame = false;
		}
	}

	$: getScore = (row: number, col: number): string => {
		if (col === 0 && data.firstLetter && row === game.attemptCount && !gameOver) {
			return 'x';
		}
		return game.attempts[row]?.score?.[col] ?? '_';
	};

	$: getValue = (row: number, col: number): string => {
		const savedAttempt = game.attempts[row]?.word;
		if (!savedAttempt?.[col] && row === game.attemptCount && !gameOver) {
			return currentAttempt[col] ?? '';
		}
		return savedAttempt?.[col] ?? '';
	};

	$: isCurrentRow = (row: number): Boolean => {
		return !gameOver && row === currentRowIndex;
	};
</script>

<svelte:window on:keydown={keydown} />

<svelte:head>
	<title>Sutom But Better</title>
	<meta name="description" content="🕹️ Play Sutom But Better Here" />
	<meta name="robots" content="index, follow" />
</svelte:head>

<h1 class="visually-hidden">Sutom</h1>

<form on:submit={submitAttempt}>
	<p>Ce jeu est en cours de development</p>
	<div class="grid" class:playing={!gameOver} class:bad-guess={badGuess} style:--columns={data.answerLength + 1}>
		{#each Array(attemptsAllowedCount) as _, row}
			{@const current = isCurrentRow(row)}
			<h2 class="visually-hidden">Row {row + 1}</h2>
			<div class="row" class:current>
				{#each Array(data.answerLength) as _, column}
					{@const wordScore = getScore(row, column)}
					{@const value = getValue(row, column)}
					{@const selected = current && column === currentAttempt?.length}
					{@const exact = wordScore === 'x'}
					{@const close = wordScore === 'c'}
					{@const missing = wordScore === '_'}
					<div class="letter" class:exact class:close class:missing class:selected>
						{value}
						<span class="visually-hidden">
							{#if exact}
								(correct)
							{:else if close}
								(present)
							{:else if missing}
								(absent)
							{:else}
								empty
							{/if}
						</span>
						<input name="guess" disabled={!current} type="hidden" {value} />
					</div>
				{/each}
				<div class="letter empty">
					{#if !!game.attempts[row]?.wordsMatching && game.attempts[row]?.wordsMatching > 1}
						<div class="attempt-count-bubble">
							{game.attempts[row]?.wordsMatching}
						</div>
					{:else if loadingGame && current}
						<div class="attempt-count-bubble">...</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="controls">
		{#if gameOver || (game.attemptCount ?? 0) >= attemptsAllowedCount}
			{#if !gameOver && data.solution}
				<p>La réponse était "{data.solution}"</p>
			{/if}
			<p class="restart">
				{won ? "c'est gagné :)" : `c'est perdu :(`}
			</p>
		{:else}
			<div class="keyboard">
				<button data-key="enter" class:selected={submittable} disabled={!submittable}> ↲ </button>

				<button on:click|preventDefault={update} data-key="backspace" name="key" value="backspace"> ⌫ </button>

				{#each ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'] as row}
					<div class="row">
						{#each row as letter}
							<button
								on:click|preventDefault={update}
								data-key={letter}
								class={classnames[letter]}
								disabled={currentAttempt.length === data.answerLength}
								name="key"
								value={letter}
								aria-label="{letter} {description[letter] || ''}"
							>
								{letter}
							</button>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</form>
{#if won}
	<div
		id="confetti"
		style="position: absolute; left: 50%; top: 30%"
		use:confetti={{
			particleCount: $reduced_motion ? 300 : (attemptsAllowedCount - game.attemptCount + 1) * 125,
			force: 0.9,
			stageWidth: window.innerWidth * 0.9,
			stageHeight: window.innerHeight * 0.65,
			colors: ['#ff3e00', '#40b3ff', '#676778'],
			duration: 5000,
		}}
	/>
{/if}

<style lang="scss">
	form {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		flex: 1;
	}

	.grid {
		--width: min(100vw, 40vh, 380px);
		max-width: var(--width);
		align-self: center;
		justify-self: center;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.grid .row {
		display: grid;
		grid-template-columns: repeat(var(--columns), 1fr);
		grid-gap: 0.2rem;
		margin: 0 0 0.2rem 0;
	}

	@media (prefers-reduced-motion: no-preference) {
		.grid.bad-guess .row.current {
			animation: wiggle 0.5s;
		}
	}

	.grid.playing .row.current {
		filter: drop-shadow(3px 3px 10px var(--color-bg-0));
	}

	.letter {
		aspect-ratio: 1;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		box-sizing: border-box;
		text-transform: lowercase;
		border: none;
		font-size: calc(0.08 * var(--width));
		border-radius: 2px;
		background: white;
		margin: 0;
		color: rgba(0, 0, 0, 0.7);
		&.missing {
			background: rgba(255, 255, 255, 0.5);
			color: rgba(0, 0, 0, 0.5);
		}

		&.exact {
			background: var(--color-theme-2);
			color: white;
		}

		&.close {
			border: 2px solid var(--color-theme-2);
		}

		&.empty {
			background: unset;
			color: unset;
		}
	}

	.selected {
		outline: 2px solid var(--color-theme-1);
	}

	.controls {
		text-align: center;
		justify-content: center;
		height: min(18vh, 10rem);
	}

	.keyboard {
		--gap: 0.2rem;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--gap);
		height: 100%;
	}

	.keyboard .row {
		display: flex;
		justify-content: center;
		gap: 0.2rem;
		flex: 1;
	}

	.keyboard button,
	.keyboard button:disabled {
		--size: min(8vw, 4vh, 40px);
		background-color: white;
		color: black;
		width: var(--size);
		border: none;
		border-radius: 2px;
		font-size: calc(var(--size) * 0.5);
		margin: 0;
	}

	.keyboard button.exact {
		background: var(--color-theme-2);
		color: white;
	}

	.keyboard button.missing {
		opacity: 0.5;
	}

	.keyboard button.close {
		border: 2px solid var(--color-theme-2);
	}

	.keyboard button:focus {
		background: var(--color-theme-1);
		color: white;
		outline: none;
	}

	.keyboard button[data-key='enter'],
	.keyboard button[data-key='backspace'] {
		position: absolute;
		bottom: 0;
		width: calc(1.7 * var(--size));
		height: calc(1 / 3 * (100% - 2 * var(--gap)));
		font-size: calc(0.5 * var(--size));
		padding-top: calc(0.15 * var(--size));
	}

	.keyboard button[data-key='enter'] {
		right: calc(50% + 3.3 * var(--size) + 0.8rem);
	}

	.keyboard button[data-key='backspace'] {
		left: calc(50% + 3.3 * var(--size) + 0.8rem);
	}

	.keyboard button[data-key='enter']:disabled {
		opacity: 0.5;
	}

	.restart {
		width: 100%;
		padding: 1rem;
		border-radius: 2px;
		border: none;
		background: var(--color-theme-1);
		color: white;
		outline: none;
	}

	@keyframes wiggle {
		0% {
			transform: translateX(0);
		}
		10% {
			transform: translateX(-2px);
		}
		30% {
			transform: translateX(4px);
		}
		50% {
			transform: translateX(-6px);
		}
		70% {
			transform: translateX(+4px);
		}
		90% {
			transform: translateX(-2px);
		}
		100% {
			transform: translateX(0);
		}
	}

	.attempt-count-bubble {
		display: inline-block;
		width: 30px;
		height: 30px;
		text-align: center;
		line-height: 30px;
		font-size: 16px;
		text-align: center;
	}
</style>
