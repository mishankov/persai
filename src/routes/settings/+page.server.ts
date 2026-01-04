import { db } from '$lib/server/db';
import { providersTable } from '$lib/server/db/schema';

export const load = async () => {
	const providers = await db.select().from(providersTable);

	return { providers };
};
