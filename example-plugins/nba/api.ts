interface Team {
	id: string;
	uid: string;
	location: string;
	name: string;
	abbreviation: string;
	displayName: string;
	shortDisplayName: string;
	color: string;
	alternateColor: string;
	isActive: boolean;
	logo: string;
}

interface Competitor {
	id: string;
	uid: string;
	type: 'team';
	order: number;
	homeAway: 'home' | 'away';
	winner: boolean;
	team: Team;
	score: string;
	linescores: {
		value: number;
		displayValue: string;
		period: number;
	}[];
	statistics: {
		name: string;
		abbreviation: string;
		displayValue: string;
	}[];
	leaders: {
		name: string;
		displayName: string;
		shortDisplayName: string;
		abbreviation: string;
		leaders: {
			displayValue: string;
			value: number;
			athlete: {
				id: string;
				fullName: string;
				displayName: string;
				shortName: string;
				headshot: string;
				jersey: string;
				position: { abbreviation: string };
				team: { id: string };
				active: boolean;
			};
			team: { id: string };
		}[];
	}[];
	records: {
		name: string;
		abbreviation: string;
		type: string;
		summary: string;
	}[];
}

interface Status {
	clock: number;
	displayClock: string;
	period: number;
	type: {
		id: string;
		name: string;
		state: 'pre' | 'live' | 'post';
		completed: boolean;
		description: string;
		detail: string;
		shortDetail: string;
	};
}

interface Competition {
	id: string;
	uid: string;
	date: string;
	attendance: number;
	type: { id: string; abbreviation: string };
	timeValid: boolean;
	neutralSite: boolean;
	conferenceCompetition: boolean;
	playByPlayAvailable: boolean;
	recent: boolean;
	venue: {
		id: string;
		fullName: string;
		address: { city: string; state: string };
		indoor: boolean;
	};
	competitors: Competitor[];
	status: Status;
	broadcasts: {
		market: 'home' | 'away' | 'national';
		names: string[];
	}[];
	format: {
		regulation: { periods: number };
	};
	startDate: string;
}

interface Event {
	id: string;
	uid: string;
	date: string;
	name: string;
	shortName: string;
	season: {
		year: number;
		type: number;
		slug: string;
	};
	competitions: Competition[];
	links: {
		language: string;
		rel: string[];
		href: string;
		text: string;
		shortText: string;
		isExternal: boolean;
		isPremium: boolean;
	}[];
	status: Status;
}

interface League {
	id: string;
	uid: string;
	name: string;
	abbreviation: string;
	slug: string;
	season: {
		year: number;
		startDate: string;
		endDate: string;
		displayName: string;
		type: {
			id: string;
			type: number;
			name: string;
			abbreviation: string;
		};
	};
	logos: {
		href: string;
		width: number;
		height: number;
		alt: string;
		rel: string[];
		lastUpdated: string;
	}[];
}

interface ScoreboardResponse {
	leagues: League[];
	season: {
		type: number;
		year: number;
	};
	day: {
		date: string;
	};
	events: Event[];
}

export const getScoreboard = async (): Promise<ScoreboardResponse> => {
	const resp = await fetch(
		'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
	);

	return (await resp.json()) as ScoreboardResponse;
};
