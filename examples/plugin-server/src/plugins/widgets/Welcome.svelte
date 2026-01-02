<script>
	let { name = 'Guest', message = 'Welcome to PersAI Plugin Server!' } = $props();

	let greeting = $state(`Hello, ${name}!`);
	let showDetails = $state(false);

	function toggleDetails() {
		showDetails = !showDetails;
	}
</script>

<div class="container mx-auto p-4">
	<div class="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-3xl">{greeting}</h2>
			<p class="text-lg opacity-90">{message}</p>

			<div class="card-actions justify-end mt-4">
				<button class="btn btn-ghost" onclick={toggleDetails}>
					{showDetails ? 'Hide' : 'Show'} Details
				</button>
			</div>

			{#if showDetails}
				<div class="mt-4 p-4 bg-base-100 text-base-content rounded-lg">
					<h3 class="font-semibold mb-2">Widget Props:</h3>
					<div class="space-y-1 text-sm font-mono">
						<div><span class="opacity-70">name:</span> {name}</div>
						<div><span class="opacity-70">message:</span> {message}</div>
					</div>

					<div class="mt-4">
						<h4 class="font-semibold mb-2">About This Widget:</h4>
						<ul class="text-sm space-y-1">
							<li>📦 Svelte 5 component</li>
							<li>🎨 Accepts props from plugin definition</li>
							<li>⚡ Fully reactive with Svelte runes</li>
							<li>🎯 Compiled at runtime by plugin server</li>
						</ul>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
