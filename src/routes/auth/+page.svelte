<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<p>
	{#if data.isLoggedIn}
		<span class="signedInText">
			<small>You are signed in</small><br />
			<strong>{data.user.name ?? 'No Name'}</strong>
		</span>
		<button on:click={() => signOut()} class="button">Sign out</button>
		<p>Providers :</p>
		<ul>
			{#each data.accounts as account}
				<li>
					{account.provider} : OK
				</li>
			{/each}
		</ul>
	{:else}
		<span class="notSignedInText">Please log in</span>
		<br />
		<button on:click={() => signIn('google')}>Login</button>
	{/if}
</p>
