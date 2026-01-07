<script lang="ts">
	import type { ToolServer } from '$lib/types';
	import EditToolServerModal from './EditToolServerModal.svelte';

	let {
		toolServer
	}: {
		toolServer: ToolServer;
	} = $props();

	let editModal = $state<EditToolServerModal>();
	toolServer = structuredClone($state.snapshot(toolServer));
</script>

<div class="card flex w-96 gap-2 bg-base-100 p-4 shadow-sm">
	<h3 class="text-2xl">{toolServer.name}</h3>
	<div>
		<div class="flex flex-row gap-2">
			<div class="flex flex-col gap-2 text-right">
				<span class="text-neutral-500">Name</span>
				<span class="text-neutral-500">Description</span>
				<span class="text-neutral-500">URL</span>
			</div>
			<div class="flex flex-col gap-2">
				<span>{toolServer.name}</span>
				<span>{toolServer.description}</span>
				<span>{toolServer.url}</span>
			</div>
		</div>
	</div>

	<div>
		<h4 class="text-xl">Tools</h4>
		<ul class="list">
			{#each Object.keys(toolServer.tools) as toolId (toolId)}
				<li class="list-row">{toolId} - {toolServer.tools[toolId].userDescription}</li>
			{/each}
		</ul>
	</div>
	<button class="btn w-20 btn-primary" onclick={() => editModal?.open()}>Edit</button>
</div>

<EditToolServerModal bind:this={editModal} {toolServer} />
