import type { Plugin } from '../../src/lib/plugins/types';
import { nbaTools } from './tools';

const nbaPlugin: Plugin = {
	id: 'nba',
	name: 'NBA Games',
	version: '1.0.0',
	description: 'View NBA game schedules, scores, and live updates from ESPN',
	author: 'PersAI Team',

	tools: nbaTools,

	widgets: [
		{
			id: 'games-list',
			title: 'NBA Games',
			description: 'Display list of NBA games with scores',
			path: '/external/nba/games' // Route in src/routes/external/nba/games/+page.svelte
		}
	],

	onLoad: async () => {
		console.log('✓ NBA Plugin loaded');
	},

	onUnload: async () => {
		console.log('✗ NBA Plugin unloaded');
	}
};

export default nbaPlugin;
