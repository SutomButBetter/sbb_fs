<script lang="ts">
	function handleClick() {
		throw new Error('TEST FRONT END ERROR');
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		await fetch('/sentry', {
			method: 'GET',
		});
	}
</script>

<button on:click={handleClick}>Throw front end error</button>

<form on:submit={handleSubmit}>
	<button type="submit">Throw back end error</button>
</form>
