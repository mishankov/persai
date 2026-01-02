<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getScoreboard } from '$lib/api';

	let games = $state<any[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const target = $derived($page.url.searchParams.get('target') || 'widget');
	const isWidget = $derived(target === 'widget');
	const isFullscreen = $derived(target === 'fullscreen');

	onMount(async () => {
		try {
			const data = await getScoreboard();
			games = data.events || [];
		} catch (err) {
			error = 'Failed to load NBA games';
			console.error(err);
		} finally {
			loading = false;
		}
	});

	function formatGameTime(dateStr: string) {
		return new Date(dateStr).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getScoreDisplay(game: any) {
		const competition = game.competitions[0];
		const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home');
		const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away');

		return {
			home: {
				name: homeTeam.team.displayName,
				score: homeTeam.score,
				logo: homeTeam.team.logo,
				records: homeTeam.records
			},
			away: {
				name: awayTeam.team.displayName,
				score: awayTeam.score,
				logo: awayTeam.team.logo,
				records: awayTeam.records
			},
			status: competition.status.type.description,
			clock: competition.status.displayClock,
			period: competition.status.period,
			detail: competition.status.type.detail
		};
	}
</script>

{#if isWidget}
	<!-- Widget Layout -->
	<div class="p-2">
		{#if loading}
			<div class="flex justify-center p-4">
				<span class="loading loading-sm loading-spinner"></span>
			</div>
		{:else if error}
			<div class="p-2 text-sm text-error">{error}</div>
		{:else if games.length === 0}
			<div class="p-2 text-sm text-base-content/60">No NBA games available</div>
		{:else}
			<div class="space-y-2">
				{#each games as game (game.id)}
					{@const gameData = getScoreDisplay(game)}
					<div class="rounded-lg bg-base-200 p-2">
						<div class="mb-1 flex items-center justify-between">
							<span class="text-xs font-medium">{gameData.status}</span>
							{#if gameData.clock && gameData.period > 0}
								<span class="badge badge-xs badge-info">Q{gameData.period} {gameData.clock}</span>
							{/if}
						</div>

						<div class="space-y-1">
							<!-- Away Team -->
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-1">
									<img src={gameData.away.logo} alt={gameData.away.name} class="h-4 w-4 rounded" />
									<span class="text-xs">{gameData.away.name}</span>
								</div>
								<span class="text-sm font-bold">{gameData.away.score}</span>
							</div>

							<!-- Home Team -->
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-1">
									<img src={gameData.home.logo} alt={gameData.home.name} class="h-4 w-4 rounded" />
									<span class="text-xs">{gameData.home.name}</span>
								</div>
								<span class="text-sm font-bold">{gameData.home.score}</span>
							</div>
						</div>

						<div class="mt-1 text-xs text-base-content/50">
							{gameData.detail || formatGameTime(game.date)}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<!-- Fullscreen Layout -->
	<div class="container mx-auto p-4">
		<h1 class="mb-6 text-3xl font-bold">NBA Games</h1>

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
		{:else if games.length === 0}
			<div class="alert alert-info">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-6 w-6 shrink-0 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
				<span>No NBA games available</span>
			</div>
		{:else}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each games as game (game.id)}
					{@const gameData = getScoreDisplay(game)}
					<div class="card bg-base-100 shadow-xl">
						<div class="card-body">
							<div class="mb-4 flex items-center justify-between">
								<h2 class="card-title text-lg">{gameData.status}</h2>
								{#if gameData.clock && gameData.period > 0}
									<div class="badge badge-info">
										Q{gameData.period}
										{gameData.clock}
									</div>
								{/if}
							</div>

							<div class="space-y-3">
								<!-- Away Team -->
								<div class="flex items-center justify-between rounded-lg bg-base-200 p-3">
									<div class="flex items-center space-x-3">
										<img
											src={gameData.away.logo}
											alt={gameData.away.name}
											class="h-8 w-8 rounded"
										/>
										<div>
											<span class="font-medium">{gameData.away.name}</span>
											{#if gameData.away.records}
												<div class="text-xs text-base-content/60">
													{gameData.away.records.find((r: any) => r.type === 'total')?.summary}
												</div>
											{/if}
										</div>
									</div>
									<span class="text-2xl font-bold">{gameData.away.score}</span>
								</div>

								<!-- Home Team -->
								<div class="flex items-center justify-between rounded-lg bg-base-200 p-3">
									<div class="flex items-center space-x-3">
										<img
											src={gameData.home.logo}
											alt={gameData.home.name}
											class="h-8 w-8 rounded"
										/>
										<div>
											<span class="font-medium">{gameData.home.name}</span>
											{#if gameData.home.records}
												<div class="text-xs text-base-content/60">
													{gameData.home.records.find((r: any) => r.type === 'total')?.summary}
												</div>
											{/if}
										</div>
									</div>
									<span class="text-2xl font-bold">{gameData.home.score}</span>
								</div>
							</div>

							<div class="mt-4 card-actions justify-end">
								<div class="text-xs text-base-content/60">
									{gameData.detail || formatGameTime(game.date)}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
