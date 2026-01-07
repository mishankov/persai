export async function POST({ request }) {
	console.log('req:', await request.text());
	const params: { gameId: string } = await request.json();

	const resp = await fetch(
		`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${params.gameId}`
	);

	return Response.json(await resp.json());
}
