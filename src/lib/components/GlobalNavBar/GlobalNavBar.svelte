<script>
	import { page } from '$app/stores';
</script>

<div class="navbar">
    <div class="navlinks">
        <div class="navlink"><a href="/">Welcome</a></div>
        <div class="navlink"><a href="/game">Game</a></div>
        <div class="navlink"><a href="/auth">Auth</a></div>
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
            <p>{$page.data.session.user.name ?? 'Unknown User'}</p>
		{/if}
    </div>
</div>

<style lang="scss">
    @import './GlobalNavBar.scss';
</style>