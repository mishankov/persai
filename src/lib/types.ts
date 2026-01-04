import type { providersTable } from '$lib/server/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

export type Provider = InferSelectModel<typeof providersTable>;
export type Model = { id?: string; name?: string };
