import { db } from '$lib/server/db';
import { modelsTable, providersTable } from '$lib/server/db/schema';
import type { Provider } from './types';

export const POST = async ({ request }) => {
	const data = (await request.json()) as Provider;

	await db.insert(providersTable).values(data);

	data.models?.forEach(async (model) => {
		await db.insert(modelsTable).values(model);
	});

	return new Response(null, { status: 200 });
};
