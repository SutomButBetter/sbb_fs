<script>
	import { page } from '$app/stores';
</script>

<div class="navbar">
    <div class="navlinks" data-sveltekit-preload-data="off">
        <div class="navlink"><a href="/">🏠 Home</a></div>
        <div class="navlink"><a href="/game">🕹️ Game</a></div>
        <div class="navlink"><a href="/games/today">🏅 Results</a></div>
    </div>
    <div class="navuser">
        {#if $page.data.session?.user}
            {#if $page.data.session.user.image || false}
                <img 
                    class="profile-picture" 
                    src="{$page.data.session.user.image}" 
                    alt="user"
                />
            {:else}
                <span class="profile-picture material-symbols-outlined">
                    I
                </span>
            {/if}
            <p>👤 {$page.data.session.user.name ?? 'Unknown User'} </p>
		{/if}
    </div>
</div>

<style lang="scss">
    @import './GlobalNavBar.scss';
</style>