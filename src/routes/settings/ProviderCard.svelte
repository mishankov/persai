<script lang="ts">
	import EditProviderModal from './EditProviderModal.svelte';
	import type { Provider } from '$lib/types';

	let {
		provider = $bindable()
	}: {
		provider: Provider;
	} = $props();

	let editModal = $state<EditProviderModal>();
</script>

<div class="card flex w-96 gap-2 bg-base-100 p-4 shadow-sm">
	<h3 class="text-2xl">{provider.name}</h3>
	<div>
		<div class="flex flex-row gap-2">
			<div class="flex flex-col gap-2 text-right">
				<span class="text-neutral-500">Base URL</span>
			</div>

			<div class="flex flex-col gap-2">
				<span>{provider.baseUrl}</span>
			</div>
		</div>
	</div>

	<div>
		<h4 class="text-xl">Models</h4>
		<ul class="list">
			{#each provider.models as model (model.id)}
				<li class="list-row">{model.name || model.id}</li>
			{/each}
		</ul>
	</div>
	<button class="btn w-20 btn-primary" onclick={() => editModal?.open()}>Edit</button>
</div>

<EditProviderModal bind:this={editModal} bind:provider />
