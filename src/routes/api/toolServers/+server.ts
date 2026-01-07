import { db } from '$lib/server/db';
import { toolServersTable } from '$lib/server/db/schema';
import type { ToolServer } from '$lib/types';
import { eq } from 'drizzle-orm';

export const POST = async ({ request }) => {
	const data = (await request.json()) as ToolServer;

	console.log(data);

	await db
		.insert(toolServersTable)
		.values(data)
		.onConflictDoUpdate({ target: toolServersTable.id, set: data });

	return new Response(null, { status: 200 });
};

export const DELETE = async ({ request }) => {
	const url = await request.text();

	await db.delete(toolServersTable).where(eq(toolServersTable.url, url));
	return new Response(null, { status: 200 });
};
