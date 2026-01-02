import type { PluginDefinition } from '../types';
import { join } from 'path';

/**
 * Example Plugin
 *
 * This is a simple example plugin that demonstrates the plugin interface.
 * Copy this file to create your own plugins!
 */

const examplePlugin: PluginDefinition = {
	id: 'example',
	name: 'Example Plugin',
	version: '1.0.0',
	description: 'An example plugin showing how to create plugins',
	author: 'PersAI Team',

	tools: {
		// Example tool: echo
		echo: {
			description: 'Echo back the input text',
			parameters: {
				text: {
					type: 'string',
					description: 'Text to echo',
					required: true
				}
			},
			execute: async ({ text }) => {
				return {
					input: text,
					output: text,
					timestamp: new Date().toISOString()
				};
			}
		},

		// Example tool: random number
		randomNumber: {
			description: 'Generate a random number',
			parameters: {
				min: {
					type: 'number',
					description: 'Minimum value',
					default: 0
				},
				max: {
					type: 'number',
					description: 'Maximum value',
					default: 100
				}
			},
			execute: async ({ min = 0, max = 100 }) => {
				const random = Math.floor(Math.random() * (max - min + 1)) + min;
				return {
					value: random,
					range: { min, max }
				};
			}
		}
	},

	widgets: {
		// Example widget: simple display
		display: {
			title: 'Example Widget',
			description: 'A simple example widget',
			render: async () => {
				return `
					<div class="container mx-auto p-4">
						<div class="card bg-base-100 shadow-xl">
							<div class="card-body">
								<h2 class="card-title">Example Widget</h2>
								<p>This is an example widget built with Tailwind CSS and DaisyUI!</p>
								<div class="card-actions justify-end">
									<button class="btn btn-primary">Action</button>
								</div>
							</div>
						</div>
					</div>
				`;
			}
		},

		// Example widget: data display
		stats: {
			title: 'Stats Widget',
			description: 'Display some statistics',
			render: async () => {
				const stats = {
					users: Math.floor(Math.random() * 1000),
					views: Math.floor(Math.random() * 10000),
					likes: Math.floor(Math.random() * 5000)
				};

				return `
					<div class="container mx-auto p-4">
						<h1 class="text-3xl font-bold mb-6">Statistics</h1>
						<div class="stats shadow">
							<div class="stat">
								<div class="stat-title">Users</div>
								<div class="stat-value">${stats.users}</div>
								<div class="stat-desc">Total registered users</div>
							</div>
							<div class="stat">
								<div class="stat-title">Views</div>
								<div class="stat-value">${stats.views}</div>
								<div class="stat-desc">Page views today</div>
							</div>
							<div class="stat">
								<div class="stat-title">Likes</div>
								<div class="stat-value">${stats.likes}</div>
								<div class="stat-desc">Total likes</div>
							</div>
						</div>
					</div>
				`;
			}
		},

		// Example Svelte widget: counter
		counter: {
			title: 'Interactive Counter',
			description: 'A reactive Svelte counter widget',
			component: join(import.meta.dir, 'widgets/Counter.svelte')
		},

		// Example Svelte widget with props: welcome
		welcome: {
			title: 'Welcome Message',
			description: 'A Svelte widget that accepts props',
			component: join(import.meta.dir, 'widgets/Welcome.svelte'),
			props: {
				name: 'Plugin Developer',
				message: 'You can pass props to Svelte widgets!'
			}
		}
	}
};

export default examplePlugin;
