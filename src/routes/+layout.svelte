<script>
	import GlobalNavBar from '$lib/components/GlobalNavBar/GlobalNavBar.svelte';
	import './styles.scss';
</script>

<div class="app">
	<GlobalNavBar />

	<main>
		<slot />
	</main>

	<footer>
		<p>Sutom But Better v{SBB_VERSION}</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
