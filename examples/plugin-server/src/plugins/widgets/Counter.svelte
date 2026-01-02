<script>
	let count = $state(0);

	function increment() {
		count++;
	}

	function decrement() {
		count--;
	}

	function reset() {
		count = 0;
	}
</script>

<div class="container mx-auto p-4">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Svelte Counter Widget</h2>
			<p class="text-sm text-base-content/70">This is a reactive Svelte 5 component!</p>

			<div class="my-6 text-center">
				<div class="text-6xl font-bold text-primary">{count}</div>
				<p class="mt-2 text-sm">Current count</p>
			</div>

			<div class="card-actions justify-center gap-2">
				<button class="btn btn-error" onclick={decrement}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
					</svg>
					Decrement
				</button>
				<button class="btn btn-neutral" onclick={reset}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
					</svg>
					Reset
				</button>
				<button class="btn btn-success" onclick={increment}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
					Increment
				</button>
			</div>

			<div class="mt-4 p-4 bg-base-200 rounded-lg">
				<h3 class="font-semibold mb-2">Features:</h3>
				<ul class="text-sm space-y-1">
					<li>✅ Svelte 5 Runes ($state)</li>
					<li>✅ Full reactivity</li>
					<li>✅ Tailwind CSS + DaisyUI</li>
					<li>✅ No build step required</li>
				</ul>
			</div>
		</div>
	</div>
</div>
