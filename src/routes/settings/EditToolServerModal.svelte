<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ToolServer } from '$lib/types';

	let {
		toolServer = $bindable()
	}: {
		toolServer: ToolServer;
	} = $props();

	let editModal = $state<HTMLDialogElement>();
	let localServer = $state<ToolServer>({ ...toolServer });

	const onSave = async () => {
		if (validate()) {
			await fetch(resolve('/api/toolServers'), {
				method: 'POST',
				body: JSON.stringify(localServer)
			});
			window.location.reload();
			editModal?.close();
		}
	};

	const validate = () => true;

	const onDelete = async () => {
		await fetch(resolve('/api/toolServers'), {
			method: 'DELETE',
			body: `${localServer.url}`
		});
		window.location.reload();
		editModal?.close();
	};

	export const open = () => {
		localServer = structuredClone($state.snapshot(toolServer));
		editModal?.showModal();
	};
</script>

<dialog bind:this={editModal} class="modal">
	<div class="modal-box flex flex-col gap-4">
		<form method="dialog">
			<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">✕</button>
		</form>

		<div class="flex flex-row gap-2">
			<input type="text" class="input" bind:value={localServer.url} />
			<button class="btn btn-primary">Load tools</button>
		</div>

		<div>
			<div class="flex flex-row gap-2">
				<div class="flex flex-col gap-2 text-right">
					<span class="text-neutral-500">Name</span>
					<span class="text-neutral-500">Description</span>
					<span class="text-neutral-500">URL</span>
				</div>
				<div class="flex flex-col gap-2">
					<span>{localServer.name}</span>
					<span>{localServer.description}</span>
					<span>{localServer.url}</span>
				</div>
			</div>
		</div>

		{#if localServer.id}
			<button class="btn w-30 btn-xs btn-error" onclick={onDelete}>Delete server</button>
		{/if}

		<h4 class="text-xl">Enable tools</h4>

		<ul class="list">
			{#each Object.keys(localServer.tools) as toolId (toolId)}
				<li class="list-row">
					<label class="label">
						<input
							type="checkbox"
							class="checkbox"
							bind:checked={localServer.tools[toolId].enabled}
						/>
						{localServer.tools[toolId].userDescription}
					</label>
				</li>
			{/each}
		</ul>

		<div class="flex flex-row gap-2">
			<button class="btn btn-primary" onclick={onSave}>Save</button>
			<button class="btn btn-soft" onclick={() => editModal?.close()}>Cancell</button>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
