import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { ModelMessage } from 'ai';
import type { Model, Tool } from '$lib/types';

export const providersTable = sqliteTable('providers', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	baseUrl: text().notNull(),
	apiKey: text().notNull(),
	models: text({ mode: 'json' }).$type<Model[]>()
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

export const toolServersTable = sqliteTable('toolServers', {
	id: int().primaryKey({ autoIncrement: true }),
	url: text().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	tools: text({ mode: 'json' }).notNull().$type<Record<string, Tool>>()
});
