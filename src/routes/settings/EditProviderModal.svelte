<script lang="ts">
	import type { Provider } from './types';

	let {
		provider,
		saveCallback = () => {}
	}: {
		provider: Provider;
		saveCallback?: (provider: Provider) => void;
	} = $props();

	let editModal = $state<HTMLDialogElement>();

	const onSave = () => {
		saveCallback(provider);
		editModal?.close();
	};

	export const open = () => {
		editModal?.showModal();
	};
</script>

<dialog bind:this={editModal} class="modal">
	<div class="modal-box flex flex-col gap-2">
		<form method="dialog">
			<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">✕</button>
		</form>

		<h4 class="text-xl">Provider info</h4>
		<label class="input w-full">
			<span class="label">Name</span>
			<input type="text" value={provider.name} />
		</label>

		<label class="input w-full">
			<span class="label">Base URL</span>
			<input type="text" value={provider.baseUrl} />
		</label>

		<label class="input w-full">
			<span class="label">API key</span>
			<input type="password" value={provider.apiKey} />
		</label>

		<div>
			<div class="flex items-center justify-between">
				<h4 class="text-xl">Models</h4>
				<button class="btn w-20 btn-xs btn-primary">Add model</button>
			</div>

			<ul class="list">
				{#each provider.models as model (model.id)}
					<li class="list-row flex flex-col gap-2 pr-0 pl-0">
						<label class="input w-full">
							<span class="label">ID</span>
							<input type="text" value={model.id} required />
						</label>

						<label class="input w-full">
							<span class="label">Name</span>
							<input type="text" value={model.name} />
						</label>
						<button class="btn w-20 btn-xs btn-error">Delete</button>
					</li>
				{/each}
			</ul>
		</div>

		<div class="flex flex-row gap-2">
			<button class="btn btn-primary" onclick={onSave}>Save</button>
			<button class="btn btn-soft" onclick={() => editModal?.close()}>Cancell</button>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
