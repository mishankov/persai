export async function POST() {
	const resp = await fetch(
		'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
	);

	return Response.json(await resp.json());
}
