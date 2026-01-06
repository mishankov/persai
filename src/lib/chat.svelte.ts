import { resolve } from '$app/paths';
import type { UIMessage } from 'ai';
import { SvelteMap } from 'svelte/reactivity';

export class Chat {
	messages: UIMessage[];
	state: 'idle' | 'generating';
	stateMessage: string;

	constructor(initialMessages: UIMessage[]) {
		this.messages = $state(initialMessages);
		this.state = $state('idle');
		this.stateMessage = $state('');
	}

	async sendMessage(params: {
		model: {
			providerId: string;
			modelId: string;
		};
		chatId: number;
		message: string;
	}) {
		this.messages.push({
			id: crypto.randomUUID(),
			role: 'user',
			parts: [
				{
					type: 'text',
					text: params.message
				}
			]
		});

		const resp = await fetch(resolve('/api/newChat'), {
			method: 'POST',
			body: JSON.stringify(params)
		});

		await this.consumeResponse(resp);
	}

	async consumeResponse(resp: Response) {
		if (!resp.ok) {
			throw new Error(`HTTP error! status: ${resp.status}`);
		}

		const reader = resp.body!.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		const toolCallIdToName = new SvelteMap<string, string>();

		// Initialize the assistant message
		const assistantMessage: UIMessage = {
			id: crypto.randomUUID(),
			role: 'assistant',
			parts: []
		};
		this.messages.push(assistantMessage);

		// Track current text part
		let currentTextPart: { type: 'text'; text: string } | null = null;

		try {
			this.state = 'generating';
			this.stateMessage = 'generating';

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					this.state = 'idle';
					this.stateMessage = '';
					break;
				}

				// Decode the chunk
				buffer += decoder.decode(value, { stream: true });

				// Split by lines
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					const trimmed = line.trim();

					// Skip empty lines
					if (!trimmed) continue;

					// Parse the data line
					if (trimmed.startsWith('data: ')) {
						const data = trimmed.slice(6);

						// Skip [DONE] signal
						if (data === '[DONE]') continue;

						try {
							const parsed = JSON.parse(data);

							// Handle different event types from AI SDK
							switch (parsed.type) {
								case 'text-delta':
									this.state = 'generating';
									this.stateMessage = 'generating';
									// Append text to the current text part
									if (!currentTextPart) {
										currentTextPart = {
											type: 'text',
											text: parsed.delta
										};
										this.messages.at(-1).parts.push(currentTextPart);
									} else {
										this.messages.at(-1).parts.at(-1).text += parsed.delta;
									}
									break;
								case 'tool-input-start':
									this.stateMessage = `calling ${parsed.toolName} tool`;
									toolCallIdToName.set(parsed.toolCallId, parsed.toolName);
									break;
								case 'tool-output-available':
									this.stateMessage = 'generating';
									this.messages.push({
										role: 'assistant',
										parts: [
											{
												type: 'tool-' + toolCallIdToName.get(parsed.toolCallId),
												output: parsed.output
											}
										]
									});
									break;
								case 'finish':
									// Stream finished
									this.state = 'idle';
									this.stateMessage = '';
									break;
								case 'error':
									// Handle errors
									throw new Error(parsed.error || 'Stream error');
							}
						} catch (e) {
							console.error('Failed to parse stream data:', data, e);
						}
					}
				}
			}
		} catch (error) {
			this.state = 'idle';
			this.stateMessage = 'Error occurred';
			console.error('Stream consumption error:', error);
			throw error;
		}

		console.log('Messages after generation:', $state.snapshot(this.messages));
	}
}
