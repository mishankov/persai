import type { providersTable, chatsTable, toolServersTable } from '$lib/server/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type Provider = InferSelectModel<typeof providersTable>;
export type Model = { id?: string; name?: string };

export type Chat = InferSelectModel<typeof chatsTable>;

export type ToolServer = InferSelectModel<typeof toolServersTable>;
export type Tool = {
	type: 'tool' | 'widget';
	userDescription: string;
	modelDescription: string;
	path: string;
	inputSchema: unknown;
	enabled?: boolean;
};
