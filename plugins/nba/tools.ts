import { z } from 'zod';
import type { PluginTool } from '../../src/lib/plugins/types';
import { getScoreboard } from './api';

export const getGamesTool: PluginTool = {
	name: 'getGames',
	description: 'Получить расписание и результаты сегодняшних матчей НБА',
	parameters: z.object({}).describe('Пустой объект'),
	execute: async () => {
		console.log('getGames called');
		const scoreboard = await getScoreboard();
		return scoreboard.events;
	}
};

export const showGamesTool: PluginTool = {
	name: 'showGames',
	description:
		'Показывает пользователю список сегодняшних игр НБА с их результатами, если игры уже прошли. Всегдя используй этот тул, если пользователь спрашивает о всех сегодняшних играх. Не подходит для отображения информации об одной игре',
	parameters: z.object({}).describe('Пустой объект'),
	execute: async () => {
		console.log('showGames called');
		return { link: '/external/nba/games' };
	}
};

export const showGameTool: PluginTool = {
	name: 'showGame',
	description:
		'Показывает пользователю результаты конкретной игры НБА. Всегдя используй этот тул, если пользователь спрашивает о конкретной игре',
	parameters: z.object({
		gameId: z.string().describe('ID игры')
	}),
	execute: async ({ gameId }) => {
		console.log('showGame called for', gameId);
		return { link: 'http://link.to/showGame/' + gameId };
	}
};

export const nbaTools: PluginTool[] = [getGamesTool, showGamesTool, showGameTool];
