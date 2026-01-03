import { db } from '$lib/server/db';
import { providersTable, modelsTable } from '$lib/server/db/schema';
import type { Provider } from './types';

export const load = async () => {
	const providersFromDB = await db.select().from(providersTable);
	const modelsFromDB = await db.select().from(modelsTable);

	const providers: Provider[] = providersFromDB.map((provider) => ({
		id: provider.id,
		name: provider.name,
		baseUrl: provider.baseUrl,
		apiKey: provider.apiKey,
		models: modelsFromDB.filter((model) => model.providerId === provider.id)
	}));

	return { providers };
};
