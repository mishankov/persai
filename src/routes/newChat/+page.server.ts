import { db } from '$lib/server/db';
import { chatsTable, providersTable, messagesTable } from '$lib/server/db/schema';
import type { Chat } from '$lib/types';

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

	const messages = await db.select().from(messagesTable);

	return { models, chat, messages };
};
