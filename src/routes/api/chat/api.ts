export const getScoreboard = async () => {
	const resp = await fetch(
		'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
	);

	return (await resp.json()) as { events: any };
};
