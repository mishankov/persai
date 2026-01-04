<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Provider } from '$lib/types';

	let {
		provider = $bindable()
	}: {
		provider: Provider;
	} = $props();

	let editModal = $state<HTMLDialogElement>();
	let localProvider = $state<Provider>({ ...provider });
	let validateMessages = $state<{
		name?: string;
		baseUrl?: string;
		apiKey?: string;
		models?: string[];
	}>({});

	const onSave = async () => {
		if (validate()) {
			await fetch(resolve('/settings'), {
				method: 'POST',
				body: JSON.stringify(localProvider)
			});
			window.location.reload();
			editModal?.close();
		}
	};

	const onDelete = async () => {
		await fetch(resolve('/settings'), {
			method: 'DELETE',
			body: `${localProvider.id}`
		});
		window.location.reload();
		editModal?.close();
	};

	const validate = () => {
		let valid = true;

		if (localProvider.name.length < 1) {
			valid = false;
			validateMessages.name = 'Name is required';
		} else {
			validateMessages.name = '';
		}

		if (localProvider.baseUrl.length < 1) {
			valid = false;
			validateMessages.baseUrl = 'Base URL is required';
		} else {
			validateMessages.baseUrl = '';
		}

		if (localProvider.apiKey.length < 1) {
			valid = false;
			validateMessages.apiKey = 'API key is required';
		} else {
			validateMessages.apiKey = '';
		}

		// Validate model IDs
		if (localProvider.models) {
			validateMessages.models = [];
			localProvider.models.forEach((model, index) => {
				if (!model.id || model.id.length < 1) {
					valid = false;
					validateMessages.models![index] = 'Model ID is required';
				} else {
					validateMessages.models![index] = '';
				}
			});
		}

		return valid;
	};

	export const open = () => {
		localProvider = structuredClone($state.snapshot(provider));
		validateMessages = {};
		editModal?.showModal();
	};
</script>

<dialog bind:this={editModal} class="modal">
	<div class="modal-box flex flex-col gap-2">
		<form method="dialog">
			<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">✕</button>
		</form>

		<h4 class="text-xl">Provider info</h4>
		<div>
			<label class={[validateMessages.name && 'input-error', 'input w-full']}>
				<span class="label">Name <span class="text-error">*</span></span>
				<input type="text" bind:value={localProvider.name} required />
			</label>
			{#if validateMessages.name}
				<div class="text-xs text-error">{validateMessages.name}</div>
			{/if}
		</div>

		<div>
			<label class={[validateMessages.baseUrl && 'input-error', 'input w-full']}>
				<span class="label">Base URL <span class="text-error">*</span></span>
				<input type="text" bind:value={localProvider.baseUrl} required />
			</label>
			{#if validateMessages.baseUrl}
				<div class="text-xs text-error">{validateMessages.baseUrl}</div>
			{/if}
		</div>

		<div>
			<label class={[validateMessages.apiKey && 'input-error', 'input w-full']}>
				<span class="label">API key <span class="text-error">*</span></span>
				<input type="password" bind:value={localProvider.apiKey} required />
			</label>
			{#if validateMessages.apiKey}
				<div class="text-xs text-error">{validateMessages.apiKey}</div>
			{/if}
		</div>

		{#if localProvider.id}
			<button class="btn w-30 btn-xs btn-error" onclick={onDelete}>Delete provider</button>
		{/if}

		<div>
			<div class="flex content-start items-center justify-between">
				<h4 class="text-xl">Models</h4>
				<button
					class="btn w-20 btn-xs btn-primary"
					onclick={() => {
						localProvider.models?.push({});
					}}>Add model</button
				>
			</div>

			<ul class="list">
				{#each localProvider.models as model, i (i)}
					<li class="list-row flex flex-col gap-2 pr-0 pl-0">
						<div>
							<label class={[validateMessages.models?.[i] && 'input-error', 'input w-full']}>
								<span class="label">ID <span class="text-error">*</span></span>
								<input type="text" bind:value={model.id} required />
							</label>
							{#if validateMessages.models?.[i]}
								<div class="text-xs text-error">{validateMessages.models[i]}</div>
							{/if}
						</div>

						<label class="input w-full">
							<span class="label">Name</span>
							<input type="text" bind:value={model.name} />
						</label>
						<button
							class="btn w-30 btn-xs btn-error"
							onclick={() => {
								localProvider.models =
									localProvider.models?.filter((el, index) => index != i) || [];
							}}>Delete model</button
						>
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
