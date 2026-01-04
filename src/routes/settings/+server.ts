import { db } from '$lib/server/db';
import { providersTable } from '$lib/server/db/schema';
import type { Provider } from '../../lib/types';
import { eq } from 'drizzle-orm';

export const POST = async ({ request }) => {
	const data = (await request.json()) as Provider;

	console.log('Provider update data', data);

	await db
		.insert(providersTable)
		.values(data)
		.onConflictDoUpdate({ target: providersTable.id, set: data });

	return new Response(null, { status: 200 });
};

export const DELETE = async ({ request }) => {
	const id = await request.text();

	console.log('Provider delete data', id);

	await db.delete(providersTable).where(eq(providersTable.id, +id));
	return new Response(null, { status: 200 });
};
