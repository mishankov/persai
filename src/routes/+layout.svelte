<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import ThemeSwitch from '$lib/ThemeSwitch.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="navbar bg-base-100 shadow-sm">
	<div class="flex-1">
		<a class="btn text-xl btn-ghost" href={resolve('/')}>PersAI</a>
		<a href={resolve('/newChat')}>New Chat</a>
	</div>
	<div class="flex-none">
		<ul class="menu menu-horizontal px-1">
			<li><a href={resolve('/settings')}>Settings</a></li>
		</ul>
		<ThemeSwitch />
	</div>
</div>

{@render children()}
