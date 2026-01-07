<script lang="ts">
	import ExternalWidget from '$lib/ExternalWidget.svelte';
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import type { PageProps } from './$types';
	import { Chat } from '$lib/chat.svelte';

	let { data }: PageProps = $props();

	let message = $state('');
	let sendDisabled = $derived(!message);
	let model = $state(`${data.models[0].providerId}$${data.models[0].id}`);

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

	let suggestions = ['Какие игры сегодня в НБА?', 'Как сыграли лейкерс?'];
	const plugins = [gfmPlugin()];
</script>

<main>
	<div class="chat">
		<div class="flex flex-row items-center gap-2">
			<h2 class="text-2xl font-bold">{data.chat.name}</h2>
		</div>

		<div class="messages">
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
								<div class="card bg-primary text-primary-content">
									<div class="card-body">
										<Markdown md={part.text} {plugins} />
									</div>
								</div>
							{:else if part.type.startsWith('tool-show') && part?.output?.baseURL && part?.output?.link}
								<ExternalWidget link={part?.output?.baseURL + part?.output?.link} />
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

<style>
	main {
		display: flex;
		justify-content: center;
	}

	.chat {
		width: 750px;
		max-width: 1000px;

		padding: 10px;

		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.suggestions {
		display: flex;
		flex-direction: row;
		gap: 10px;
	}

	.chat form {
		width: 100%;

		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.chat form textarea {
		width: 100%;
	}
</style>
