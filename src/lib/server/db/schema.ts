import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const providersTable = sqliteTable('providers', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	baseUrl: text().notNull(),
	apiKey: text().notNull()
});

export const modelsTable = sqliteTable('models', {
	id: text().primaryKey(),
	name: text(),
	providerId: int()
});
