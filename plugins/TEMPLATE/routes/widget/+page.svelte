<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	// State
	let data = $state<any>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Check if this is widget or fullscreen mode
	const target = $derived($page.url.searchParams.get('target') || 'widget');
	const isWidget = $derived(target === 'widget');

	// Load data on mount
	onMount(async () => {
		try {
			// Fetch your data here
			const response = await fetch('https://api.example.com/data');
			if (!response.ok) throw new Error('Failed to fetch');
			data = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load data';
			console.error(err);
		} finally {
			loading = false;
		}
	});
</script>

{#if isWidget}
	<!-- Widget Layout (compact view) -->
	<div class="p-2">
		{#if loading}
			<div class="flex justify-center p-4">
				<span class="loading loading-sm loading-spinner"></span>
			</div>
		{:else if error}
			<div class="p-2 text-sm text-error">{error}</div>
		{:else if !data}
			<div class="p-2 text-sm text-base-content/60">No data available</div>
		{:else}
			<!-- Your compact widget UI here -->
			<div class="space-y-2">
				<div class="text-sm font-medium">Widget Content</div>
				<pre class="text-xs">{JSON.stringify(data, null, 2)}</pre>
			</div>
		{/if}
	</div>
{:else}
	<!-- Fullscreen Layout (expanded view) -->
	<div class="container mx-auto p-4">
		<h1 class="mb-6 text-3xl font-bold">My Plugin Widget</h1>

		{#if loading}
			<div class="flex justify-center">
				<span class="loading loading-lg loading-spinner"></span>
			</div>
		{:else if error}
			<div class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>{error}</span>
			</div>
		{:else if !data}
			<div class="alert alert-info">
				<span>No data available</span>
			</div>
		{:else}
			<!-- Your full-screen UI here -->
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">Data</h2>
					<pre class="overflow-auto">{JSON.stringify(data, null, 2)}</pre>
				</div>
			</div>
		{/if}
	</div>
{/if}
