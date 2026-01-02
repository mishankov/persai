/**
 * NBA API client using ESPN Scoreboard API
 */

export interface ESPNScoreboardResponse {
	events: any[];
}

export const getScoreboard = async (): Promise<ESPNScoreboardResponse> => {
	const resp = await fetch(
		'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
	);

	if (!resp.ok) {
		throw new Error(`ESPN API error: ${resp.status} ${resp.statusText}`);
	}

	return await resp.json();
};
