import { db } from '$lib/server/db';
import { providersTable, toolServersTable } from '$lib/server/db/schema';

export const load = async () => {
	const providers = await db.select().from(providersTable);
	const toolServers = await db.select().from(toolServersTable);

	return { providers, toolServers };
};
