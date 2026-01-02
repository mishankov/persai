import { tool, type Tool } from 'ai';
import { z } from 'zod';

const coreTools = {
	webfetch: tool({
		description: 'Fetches data from web by link. Never use links from show tools here',
		inputSchema: z.object({
			link: z.string()
		}),
		execute: async ({ link }) => {
			console.log('webfetch called with', link);
			const response = await fetch(link);
			const text = await response.text();
			return text;
		}
	})
};

const plugins = ['http://localhost:4444'];

export const loadTools = async () => {
	const tools: Record<string, Tool> = coreTools;

	for (const plugin of plugins) {
		const resp = await fetch(plugin + '/manifest.json');
		const pluginData = await resp.json();

		console.log('plugin loaded', pluginData);

		Object.keys(pluginData.tools).forEach((toolId) => {
			const pluginTool = pluginData.tools[toolId];
			tools[toolId] = tool({
				description: pluginTool.modelDescription,
				inputSchema: z.object(),
				execute: async (inputData) => {
					console.log('executing tool', toolId);
					const response = await fetch(plugin + pluginTool.path, {
						method: 'POST',
						body: JSON.stringify(inputData)
					});
					const outputData = await response.json();

					if (pluginTool.type === 'widget') {
						outputData.baseURL = plugin;
					}

					return outputData;
				}
			});
		});
	}

	console.log('tools loaded');
	console.table(
		Object.keys(tools).map((toolId) => {
			return { toolId };
		})
	);
	return tools;
};
