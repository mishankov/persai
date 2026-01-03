<script lang="ts">
	import type { PageProps } from './$types';
	import EditProviderModal from './EditProviderModal.svelte';
	import ProviderCard from './ProviderCard.svelte';

	let { data }: PageProps = $props();

	let providers = $state(data.providers);

	let newProviderModal = $state<EditProviderModal>();
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
					saveCallback={async () => {}}
					provider={{
						name: '',
						baseUrl: '',
						apiKey: '',
						models: [{ id: '' }]
					}}
				/>
			</div>

			<div class="flex flex-row gap-2">
				{#each providers as provider (provider.id)}
					<ProviderCard {provider} />
				{/each}
			</div>
		</section>
	</div>
</div>
