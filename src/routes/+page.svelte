<script lang="ts">
</script>

<svelte:head>
	<title>Sutom But Better</title>
	<meta name="description" content="🕹️ Welcome to SutomButBetter" />
	<meta name="robots" content="index, follow" />
</svelte:head>

<div class="welcome-div">
	<h1 class="welcome-text">Welcome</h1>
	<img class="welcome-logo" src="./logo.png" alt="logo" />
</div>
<a href="/game" data-sveltekit-preload-data="off">Start a game 🕹️</a>

<style lang="scss">
	.welcome-div {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.welcome-text {
		text-align: center;
	}

	.welcome-logo {
		height: 2em;
		width: 2em;
		padding-left: 1em;
	}
</style>
