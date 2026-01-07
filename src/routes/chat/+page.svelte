<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import ExternalWidget from '$lib/ExternalWidget.svelte';
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import type { PageProps } from './$types';
	import { Chat } from '$lib/chat.svelte';

	let { data }: PageProps = $props();

	const MODEL_STORAGE_KEY = 'persai-selected-model';
	const defaultModel = `${data.models[0].providerId}$${data.models[0].id}`;

	function getInitialModel(): string {
		if (!browser) return defaultModel;

		const saved = localStorage.getItem(MODEL_STORAGE_KEY);
		if (!saved) return defaultModel;

		// Check if saved model still exists in available models
		const isValid = data.models.some((m) => `${m.providerId}$${m.id}` === saved);
		return isValid ? saved : defaultModel;
	}

	let message = $state('');
	let sendDisabled = $derived(!message);
	let model = $state(getInitialModel());

	// Persist model selection to localStorage
	$effect(() => {
		if (browser) {
			localStorage.setItem(MODEL_STORAGE_KEY, model);
		}
	});

	const chat = new Chat(data.messages);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		chat.sendMessage({
			model: {
				providerId: model.split('$')[0],
				modelId: model.split('$')[1]
			},
			chatId: data.chat.id,
			message: message
		});
		message = '';
	}

	let suggestions = ['What can you do?', 'What games are today in NBA?', 'How are Lakers played?'];
	const plugins = [gfmPlugin()];

	let clearModal = $state<HTMLDialogElement>();

	async function clearChat() {
		await fetch(resolve('/api/chat'), {
			method: 'DELETE',
			body: `${data.chat.id}`
		});
		window.location.reload();
	}

	// Auto-scroll functionality
	let messagesContainer = $state<HTMLDivElement>();
	let isAtBottom = $state(true);

	function checkIfAtBottom() {
		if (!messagesContainer) return;
		const threshold = 50;
		const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
		isAtBottom = scrollHeight - scrollTop - clientHeight < threshold;
	}

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
			isAtBottom = true;
		}
	}

	// Scroll to bottom on mount
	$effect(() => {
		if (browser && messagesContainer) {
			scrollToBottom();
		}
	});

	// Auto-scroll when new messages are added (if user is at bottom)
	$effect(() => {
		// Track messages length to trigger effect on new messages
		const _len = chat.messages.length;
		if (browser && isAtBottom) {
			// Use setTimeout to ensure DOM has updated
			setTimeout(scrollToBottom, 0);
		}
	});

	// Auto-scroll during streaming generation
	$effect(() => {
		if (chat.state === 'generating' && browser && isAtBottom) {
			const interval = setInterval(scrollToBottom, 100);
			return () => clearInterval(interval);
		}
	});
</script>

<main>
	<div class="chat-container">
		<div class="flex flex-row items-center justify-between">
			<h2 class="text-2xl font-bold">{data.chat.name}</h2>
			<button class="btn btn-ghost btn-sm" onclick={() => clearModal?.showModal()}>Clear</button>
		</div>

		<div class="messages" bind:this={messagesContainer} onscroll={checkIfAtBottom}>
			{#each chat.messages as message, messageIndex (messageIndex)}
				{#if message}
					{#each message.parts as part, partIndex (partIndex)}
						<div
							class={[
								'chat',
								message.role === 'user' || 'chat-start',
								message.role === 'assistant' || 'chat-end'
							]}
						>
							{#if part.type === 'text'}
								<div class="chat-header">{message.role}</div>
								<div class="chat-bubble chat-bubble-primary">
									<Markdown md={part.text} {plugins} />
								</div>
							{:else if part.type === 'reasoning'}
								<div class="chat-header">{message.role} (reasoning)</div>
								<div class="chat-bubble">
									<details class="collapse">
										<summary class="collapse-title p-0 text-sm font-semibold">Reasoning...</summary>
										<div class="collapse-content text-sm">
											<Markdown md={part.text} {plugins} />
										</div>
									</details>
								</div>
							{:else if part.type.startsWith('tool-show') && part?.output?.baseURL && part?.output?.link}
								<div class="chat-header">{message.role}</div>
								<div class="chat-bubble chat-bubble-primary p-0">
									<ExternalWidget link={part?.output?.baseURL + part?.output?.link} />
								</div>
							{:else if part.type.startsWith('tool')}
								<div class="badge badge-ghost">
									{`Called ${part.type.replace('tool-', '')} tool`}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			{/each}
		</div>

		{#if !isAtBottom}
			<button class="scroll-to-bottom btn btn-circle btn-primary" onclick={scrollToBottom}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 14l-7 7m0 0l-7-7m7 7V3"
					/>
				</svg>
			</button>
		{/if}

		{#if chat.errorMessage}
			<div role="alert" class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>{chat.errorMessage}</span>
			</div>
		{/if}

		{#if chat.state === 'generating'}
			<div class="flex flex-row items-center gap-2">
				<span class="loading loading-xs loading-dots text-neutral-400"></span>
				<span class="skeleton skeleton-text text-sm">{chat.stateMessage}</span>
			</div>
		{/if}

		<div class="suggestions">
			{#each suggestions as s (s)}
				<button
					class="badge badge-accent"
					onclick={() => {
						message = s;
					}}
				>
					{s}
				</button>
			{/each}
		</div>
		<form onsubmit={handleSubmit}>
			<textarea bind:value={message} class="textarea textarea-primary"> </textarea>
			<div class="flex flex-row gap-2">
				<button type="submit" class="btn flex-1 btn-primary" disabled={sendDisabled}>Send</button>
				<label class="select flex-2">
					<span class="label">Model</span>
					<select bind:value={model}>
						{#each data.models as model (model.id)}
							<option value={`${model.providerId}$${model.id}`}
								>{`${model.providerName} / ${model.name || model.id}`}</option
							>
						{/each}
					</select>
				</label>
			</div>
		</form>
	</div>
</main>

<dialog bind:this={clearModal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Clear chat</h3>
		<p class="py-4">Are you sure you want to clear all messages in this chat?</p>
		<div class="modal-action">
			<button class="btn btn-error" onclick={clearChat}>Yes, clear</button>
			<button class="btn" onclick={() => clearModal?.close()}>Cancel</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<style>
	main {
		display: flex;
		justify-content: center;
	}

	.chat-container {
		width: 750px;
		max-width: 1000px;
		height: calc(100vh - 80px);

		padding: 10px;

		display: flex;
		flex-direction: column;
		gap: 10px;
		position: relative;
	}

	.messages {
		flex: 1;
		overflow-y: auto;
	}

	.scroll-to-bottom {
		position: absolute;
		bottom: 200px;
		right: 20px;
	}

	.suggestions {
		display: flex;
		flex-direction: row;
		gap: 10px;
	}

	.chat-container form {
		width: 100%;

		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.chat-container form textarea {
		width: 100%;
	}
</style>
