/**
 * NBA API client using ESPN Scoreboard API
 */

const ESPN_API = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

export interface Game {
	id: string;
	name: string;
	date: string;
	status: {
		type: string;
		description: string;
		detail: string;
		displayClock?: string;
		period?: number;
	};
	competitions: Array<{
		id: string;
		competitors: Array<{
			id: string;
			team: {
				id: string;
				displayName: string;
				abbreviation: string;
				logo: string;
			};
			score: string;
			homeAway: 'home' | 'away';
			records?: Array<{
				type: string;
				summary: string;
			}>;
		}>;
	}>;
}

export interface ScoreboardResponse {
	events: Game[];
	day?: {
		date: string;
	};
}

/**
 * Fetch NBA scoreboard data from ESPN
 */
export async function getScoreboard(date?: string): Promise<ScoreboardResponse> {
	const url = date ? `${ESPN_API}?dates=${date}` : ESPN_API;

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
	}

	return await response.json();
}

/**
 * Format game data for display
 */
export function formatGameData(game: Game) {
	const competition = game.competitions[0];
	const homeTeam = competition.competitors.find((c) => c.homeAway === 'home');
	const awayTeam = competition.competitors.find((c) => c.homeAway === 'away');

	if (!homeTeam || !awayTeam) {
		throw new Error('Invalid game data');
	}

	return {
		id: game.id,
		name: game.name,
		date: game.date,
		home: {
			name: homeTeam.team.displayName,
			abbreviation: homeTeam.team.abbreviation,
			score: homeTeam.score,
			logo: homeTeam.team.logo,
			records: homeTeam.records
		},
		away: {
			name: awayTeam.team.displayName,
			abbreviation: awayTeam.team.abbreviation,
			score: awayTeam.score,
			logo: awayTeam.team.logo,
			records: awayTeam.records
		},
		status: game.status.description,
		statusDetail: game.status.detail,
		clock: game.status.displayClock,
		period: game.status.period
	};
}
