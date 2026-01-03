<script lang="ts">
	import EditProviderModal from './EditProviderModal.svelte';
	import ProviderCard from './ProviderCard.svelte';
	import type { Provider } from './types';

	let providers = $state<Provider[]>([
		{
			id: '1',
			name: 'OpenAI',
			baseUrl: 'https://api.openai.com/v1',
			apiKey: 'sk-...',
			models: [
				{ id: 'gpt-4', name: 'GPT-4' },
				{ id: 'gpt-3.5-turbo', name: 'GPT-3.5' }
			]
		},
		{
			id: '2',
			name: 'Anthropic',
			baseUrl: 'https://api.anthropic.com',
			apiKey: 'sk-ant-...',
			models: [{ id: 'claude-3-opus' }, { id: 'claude-3-sonnet' }]
		}
	]);

	let newProviderModal = $state<EditProviderModal>();
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="space-y-8">
		<!-- Providers Section -->
		<section>
			<div class="flex items-center justify-between pb-6">
				<h2 class="text-4xl">Providers and models</h2>
				<button class="btn btn-primary" onclick={() => newProviderModal?.open()}
					>Add Provider</button
				>
				<EditProviderModal
					bind:this={newProviderModal}
					provider={{
						id: '',
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
