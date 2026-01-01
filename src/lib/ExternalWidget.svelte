<script lang="ts">
	import Modal from './Modal.svelte';

	let { link = '' } = $props();

	let modal = $state<HTMLDialogElement>();

	const openFullScreen = () => {
		modal?.showModal();
	};
</script>

<div class="card h-96 w-96 bg-primary text-primary-content shadow-xl">
	<div class="card-title justify-center text-sm">
		Widget
		<button class="btn btn-sm btn-primary" onclick={openFullScreen}>Open full screen</button>
	</div>
	<iframe
		src={link + '?target=widget'}
		frameborder="0"
		width="100%"
		height="100%"
		title="External content"
	>
	</iframe>

	<dialog bind:this={modal} class="modal">
		<div class="modal-box h-full w-11/12 max-w-full">
			<form method="dialog">
				<button class="btn absolute top-2 right-2 btn-circle btn-sm">✕</button>
			</form>
			<iframe
				src={link + '?target=fullscreen'}
				frameborder="0"
				width="100%"
				height="100%"
				title="External content"
				class="pt-4"
			>
			</iframe>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
</div>
