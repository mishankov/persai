<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		kind = 'primary',
		openCallback = () => {},
		closeCallback = () => {}
	}: {
		children?: Snippet;
		kind?: 'primary' | 'danger';
		openCallback?: () => void;
		closeCallback?: () => void;
	} = $props();

	let dialog = $state<HTMLDialogElement>();
	export const open = () => {
		openCallback();
		dialog?.showModal();
	};

	export const close = () => {
		closeCallback();
		dialog?.close();
	};
</script>

<dialog
	bind:this={dialog}
	class={kind}
	onclick={(e: MouseEvent) => {
		if (e.target === dialog) {
			close();
		}
	}}
>
	<div class="modal-content">
		{@render children?.()}
	</div>
</dialog>

<style>
	dialog {
		top: 50%;
		left: 50%;
		transform: translateX(-50%) translateY(-50%);

		padding: 0;

		transition: all 300ms;
	}

	dialog[open] {
		animation: fadein 300ms ease-in forwards;
	}

	@keyframes fadein {
		0% {
			opacity: 0;
			transform: translateX(-50%) translateY(-50%) scale(0.95);
		}
		100% {
			opacity: 1;
			transform: translateX(-50%) translateY(-50%) scale(1);
		}
	}

	::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}
</style>
