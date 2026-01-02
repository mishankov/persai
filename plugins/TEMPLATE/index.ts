import { z } from 'zod';
import type { Plugin } from '../../src/lib/plugins/types';

/**
 * Example PersAI Plugin Template
 *
 * This template shows how to create a plugin for PersAI with:
 * - AI tools that can be called by the LLM
 * - Optional widgets for displaying data
 * - Lifecycle hooks
 *
 * IMPORTANT NOTES:
 *
 * For LOCAL plugins:
 * - Tools and logic go in this plugins/ directory ✓
 * - Svelte widget files MUST be in src/routes/external/[plugin-id]/ (SvelteKit requirement)
 * - The 'path' in widgets array should be the route path (e.g., '/external/my-plugin/widget')
 *
 * For EXTERNAL SERVICE plugins:
 * - Everything can be in your external service
 * - Widgets are served from your HTTP server
 * - The 'path' is the full URL to your widget
 */

const myPlugin: Plugin = {
	// Required fields
	id: 'my-plugin',
	name: 'My Awesome Plugin',
	version: '1.0.0',

	// Optional fields
	description: 'This plugin does amazing things',
	author: 'Your Name',

	// AI Tools (these live in this directory - works great!)
	tools: [
		{
			name: 'myTool',
			description: 'What this tool does (the AI will read this)',
			parameters: z.object({
				input: z.string().describe('Description of the input parameter')
			}),
			execute: async ({ input }) => {
				// Your tool logic here
				console.log('myTool called with:', input);

				// Example: Fetch data from an API
				// const response = await fetch('https://api.example.com/data');
				// const data = await response.json();

				// Return the result
				return {
					result: `Processed: ${input}`,
					// You can return any JSON-serializable data
				};
			}
		},
		{
			name: 'showWidget',
			description: 'Display a widget to the user',
			parameters: z.object({}),
			execute: async () => {
				// Return a link to your widget route
				// Note: The widget Svelte file must be in src/routes/external/my-plugin/widget/+page.svelte
				return {
					link: '/external/my-plugin/widget'
				};
			}
		}
	],

	// Optional: Widget metadata
	// IMPORTANT: For local plugins, the actual .svelte file must be in:
	//   src/routes/external/my-plugin/widget/+page.svelte
	// This is a SvelteKit limitation - Svelte components must be in src/routes/
	widgets: [
		{
			id: 'my-widget',
			title: 'My Widget',
			description: 'A widget that displays cool data',
			path: '/external/my-plugin/widget' // Route path, NOT file path
		}
	],

	// Optional: Lifecycle hooks
	onLoad: async () => {
		console.log('✓ My Plugin loaded');
		// Initialize resources, connections, etc.
	},

	onUnload: async () => {
		console.log('✗ My Plugin unloaded');
		// Cleanup resources
	}
};

export default myPlugin;
