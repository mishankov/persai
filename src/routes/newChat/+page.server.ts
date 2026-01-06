import { db } from '$lib/server/db';
import { chatsTable, providersTable, messagesTable } from '$lib/server/db/schema';
import type { Chat } from '$lib/types';
import type { UIMessage } from 'ai';

export const load = async () => {
	const providers = await db.select().from(providersTable);

	const models: {
		id?: string;
		name?: string;
		providerId: number;
		providerName: string;
	}[] = [];

	providers.forEach((provider) => {
		provider.models?.forEach((model) => {
			models.push({
				id: model.id,
				name: model.name,
				providerId: provider.id,
				providerName: provider.name
			});
		});
	});

	const chats = await db.select().from(chatsTable);
	let chat: Chat;

	if (chats.length === 0) {
		chat = {
			id: 0,
			name: 'main'
		};

		await db.insert(chatsTable).values(chat);
	} else {
		chat = chats[0];
	}

	const messages: UIMessage[] = (await db.select().from(messagesTable)).map((message) => {
		switch (message.content.role) {
			case 'user':
				return {
					id: crypto.randomUUID(),
					role: 'user',
					parts: [{ type: 'text', text: message.content.content }]
				} as UIMessage;
			case 'assistant':
				if (message.content.content[0].type === 'text') {
					return {
						id: crypto.randomUUID(),
						role: 'assistant',
						parts: [{ type: 'text', text: message.content.content[0].text }]
					} as UIMessage;
				}
				break;
			case 'tool':
				return {
					id: crypto.randomUUID(),
					role: 'assistant',
					parts: [
						{
							type: 'tool-' + message.content.content[0].toolName,
							output: message.content.content[0].output.value
						}
					]
				};
			case 'system':
				return {
					id: crypto.randomUUID(),
					role: 'system',
					parts: [{ type: 'text', text: message.content.content }]
				} as UIMessage;
		}
	});

	return { models, chat, messages };
};
