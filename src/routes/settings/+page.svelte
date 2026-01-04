<script lang="ts">
	import type { PageProps } from './$types';
	import EditProviderModal from './EditProviderModal.svelte';
	import ProviderCard from './ProviderCard.svelte';
	import type { Provider } from '$lib/types';

	let { data }: PageProps = $props();

	let providers = $state<Provider[]>([]);

	function setData() {
		providers = [...data.providers];
	}

	let newProviderModal = $state<EditProviderModal>();

	setData();
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="space-y-8">
		<section>
			<div class="flex items-center justify-between pb-6">
				<h2 class="text-4xl">Providers and models</h2>
				<button class="btn btn-primary" onclick={() => newProviderModal?.open()}
					>Add Provider</button
				>
				<EditProviderModal
					bind:this={newProviderModal}
					provider={{
						id: NaN,
						name: '',
						baseUrl: '',
						apiKey: '',
						models: [{}]
					}}
				/>
			</div>
			{#if providers.length > 0}
				<div class="flex flex-row gap-2">
					{#each providers as provider, i (provider.id)}
						<ProviderCard bind:provider={providers[i]} />
					{/each}
				</div>
			{:else}
				<div class="card w-full bg-base-300 text-base-content">
					<div class="card-body items-center text-center">
						<h2 class="card-title">Add your first provider</h2>
						<p>and models</p>
						<div class="card-actions justify-end">
							<button class="btn btn-primary" onclick={() => newProviderModal?.open()}
								>Add Provider</button
							>
						</div>
					</div>
				</div>
			{/if}
		</section>
	</div>
</div>
