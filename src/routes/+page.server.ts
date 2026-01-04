import { db } from '$lib/server/db';
import { providersTable } from '$lib/server/db/schema';

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

	return { models };
};
