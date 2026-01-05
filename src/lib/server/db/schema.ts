import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { ModelMessage } from 'ai';

export const providersTable = sqliteTable('providers', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	baseUrl: text().notNull(),
	apiKey: text().notNull(),
	models: text({ mode: 'json' }).$type<{ id?: string; name?: string }[]>()
});

export const chatsTable = sqliteTable('chats', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull()
});

export const messagesTable = sqliteTable('messages', {
	id: int().primaryKey({ autoIncrement: true }),
	chatId: int().notNull(),
	content: text({ mode: 'json' }).notNull().$type<ModelMessage>(),
	createdAt: text().notNull()
});
