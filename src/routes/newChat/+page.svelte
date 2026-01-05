<script lang="ts">
	import ExternalWidget from '$lib/ExternalWidget.svelte';
	import { Chat } from '@ai-sdk/svelte';
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let input = $state('');
	let sendDisabled = $derived(!input);
	const chat = new Chat({});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		chat.sendMessage({ text: input });
		input = '';
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
			{#each data.messages as message, messageIndex (messageIndex)}
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
							<div class="chat-bubble">
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
							<div class="badge badge-ghost">{'Вызвал тулзу ' + part.type}</div>
						{/if}
					</div>
				{/each}
			{/each}
		</div>

		<div class="suggestions">
			{#each suggestions as s (s)}
				<button
					class="badge badge-accent"
					onclick={() => {
						input = s;
					}}
				>
					{s}
				</button>
			{/each}
		</div>
		<form onsubmit={handleSubmit}>
			<textarea bind:value={input} class="textarea textarea-primary"> </textarea>
			<div class="flex flex-row gap-2">
				<button type="submit" class="btn flex-1 btn-primary" disabled={sendDisabled}>Send</button>
				<label class="select flex-2">
					<span class="label">Model</span>
					<select>
						{#each data.models as model (model.id)}
							<option>{`${model.providerName} / ${model.name || model.id}`}</option>
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
