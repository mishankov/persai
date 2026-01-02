import { getScoreboard } from './api';

const tools = {
	getGames: {
		type: 'data',
		userDescription: 'Получить расписание и результаты сегодняшних матчей НБА',
		modelDescription: 'Получить расписание и результаты сегодняшних матчей НБА',
		path: '/api/getGames'
	},
	showGames: {
		type: 'widget',
		userDescription: 'Виджет отображения информации по играм',
		modelDescription:
			'Показывает пользователю список сегодняшних игр НБА с их результатами, если игры уже прошли. Всегдя используй этот тул, если пользователь спрашивает о всех сегодняшних играх. Не подходит для отображения информации об одной игре',
		path: '/api/showGames'
	}
};

const plugin = {
	name: 'NBA',
	description: 'Информация об играх НБА',
	tools: tools
};

const server = Bun.serve({
	routes: {
		'/manifest.json': Response.json(plugin),
		'/api/getGames': {
			POST: async () => {
				console.log('getGames invoked');

				const data = await getScoreboard();
				return Response.json(data);
			}
		},
		'/api/showGames': {
			POST: async () => {
				console.log('showGames invoked');
				return Response.json({ link: '/games' });
			}
		},
		'/games': () => new Response(Bun.file('games.html'))
	},
	port: 4444
});

console.log(`Server started ${server.url}`);
