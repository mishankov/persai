import { tool, type Tool, jsonSchema } from 'ai';
import { z } from 'zod';

const coreTools = {
	webfetch: tool({
		description: 'Fetches data from web by link. Never use links from show tools here',
		inputSchema: jsonSchema<{ link: string }>({
			type: 'object',
			properties: {
				link: { type: 'string' }
			}
		}),
		execute: async ({ link }: { link: string }) => {
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
				inputSchema: jsonSchema(pluginTool.inputSchema),
				execute: async (inputData) => {
					const inputJson = JSON.stringify(inputData);
					console.log('executing tool', toolId, 'with params', inputJson);
					const response = await fetch(plugin + pluginTool.path, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: inputJson
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
