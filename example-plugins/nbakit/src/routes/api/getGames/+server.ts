import { getScoreboard } from '$lib/api';

export async function POST() {
	const data = await getScoreboard();
	return Response.json(data);
}
