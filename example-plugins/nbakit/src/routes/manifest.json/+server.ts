const tools = {
	getGames: {
		type: 'tool',
		userDescription: 'Get schedule and results of todays NBA games',
		modelDescription: 'Get schedule and results of todays NBA games',
		path: '/api/getGames',
		inputSchema: {
			type: 'object',
			properties: {}
		}
	},
	getGame: {
		type: 'tool',
		userDescription: 'Get information about specific NBA game',
		modelDescription: 'Get information about specific NBA game by its id',
		path: '/api/getGame',
		inputSchema: {
			type: 'object',
			properties: {
				gameId: { type: 'string' }
			}
		}
	},
	showGames: {
		type: 'widget',
		userDescription: 'Widget that shows todays NBA games',
		modelDescription:
			'Shows the user a list of todays NBA games with their results, if the games have already been played. Always use this tool if the user is asking about all of todays games. Not suitable for displaying information about a single game',
		path: '/api/showGames',
		inputSchema: {
			type: 'object',
			properties: {}
		}
	}
};

const plugin = {
	name: 'NBA',
	description: 'Information about NBA Games',
	tools: tools
};

export async function GET() {
	return Response.json(plugin);
}
