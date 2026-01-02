import { plugins } from './plugins';
import type { PluginManifest } from './types';
import { loadCompiledWidget } from './svelte-compiler';

const PORT = process.env.PORT || 4444;

/**
 * PersAI Plugin Server
 *
 * Hosts multiple plugins in a single Bun application.
 * Plugins are installed as npm packages and registered in src/plugins/index.ts
 */

console.log(`\n🔌 Starting PersAI Plugin Server...`);
console.log(`📦 Loaded ${plugins.length} plugin(s):\n`);

plugins.forEach((plugin) => {
	const toolCount = Object.keys(plugin.tools || {}).length;
	const widgetCount = Object.keys(plugin.widgets || {}).length;
	console.log(
		`  ✓ ${plugin.name} v${plugin.version} (${toolCount} tools, ${widgetCount} widgets)`
	);
});

Bun.serve({
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url);
		console.log(`${req.method} ${url.pathname}`);

		// CORS headers
		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization'
		};

		if (req.method === 'OPTIONS') {
			return new Response(null, { headers });
		}

		try {
			// Root - List all plugins
			if (url.pathname === '/' || url.pathname === '') {
				return Response.json(
					{
						server: 'PersAI Plugin Server',
						version: '1.0.0',
						plugins: plugins.map((p) => ({
							id: p.id,
							name: p.name,
							version: p.version,
							manifestUrl: `/plugins/${p.id}/manifest.json`
						}))
					},
					{ headers }
				);
			}

			// Health check
			if (url.pathname === '/health') {
				return Response.json({ status: 'healthy', plugins: plugins.length }, { headers });
			}

			// Plugin routes: /plugins/{pluginId}/*
			const pluginMatch = url.pathname.match(/^\/plugins\/([^\/]+)\/(.+)$/);
			if (pluginMatch) {
				const [, pluginId, path] = pluginMatch;
				const plugin = plugins.find((p) => p.id === pluginId);

				if (!plugin) {
					return new Response('Plugin not found', { status: 404, headers });
				}

				// Manifest endpoint: /plugins/{id}/manifest.json
				if (path === 'manifest.json') {
					const manifest: PluginManifest = {
						id: plugin.id,
						name: plugin.name,
						version: plugin.version,
						description: plugin.description,
						author: plugin.author,
						tools: Object.entries(plugin.tools || {}).map(([name, tool]) => ({
							name,
							description: tool.description,
							endpoint: `/plugins/${pluginId}/tools/${name}`,
							parameters: convertParametersToJsonSchema(tool.parameters || {})
						})),
						widgets: Object.entries(plugin.widgets || {}).map(([id, widget]) => ({
							id,
							title: widget.title,
							description: widget.description,
							url: `/plugins/${pluginId}/widgets/${id}`
						}))
					};
					return Response.json(manifest, { headers });
				}

				// Tool execution: /plugins/{id}/tools/{toolName}
				const toolMatch = path.match(/^tools\/([^\/]+)$/);
				if (toolMatch) {
					const [, toolName] = toolMatch;
					const tool = plugin.tools?.[toolName];

					if (!tool) {
						return new Response('Tool not found', { status: 404, headers });
					}

					if (req.method !== 'POST') {
						return new Response('Method not allowed', { status: 405, headers });
					}

					const params = await req.json();
					const result = await tool.execute(params);

					return Response.json(result, { headers });
				}

				// Widget rendering: /plugins/{id}/widgets/{widgetId}
				const widgetMatch = path.match(/^widgets\/([^\/]+)$/);
				if (widgetMatch) {
					const [, widgetId] = widgetMatch;
					const widget = plugin.widgets?.[widgetId];

					if (!widget) {
						return new Response('Widget not found', { status: 404, headers });
					}

					let html: string;

					// Check if it's a Svelte component or a render function
					if (widget.component) {
						// Load pre-compiled Svelte widget
						html = await loadCompiledWidget(pluginId, widgetId, widget.props);
					} else if (widget.render) {
						// Use render function
						const content = await widget.render();
						html = wrapWidgetHtml(content, widget.title);
					} else {
						return new Response('Widget has no render function or component', {
							status: 500,
							headers
						});
					}

					return new Response(html, {
						headers: {
							...headers,
							'Content-Type': 'text/html; charset=utf-8'
						}
					});
				}
			}

			// Global manifest (backward compatibility)
			if (url.pathname === '/manifest.json' && plugins.length > 0) {
				// Return first plugin's manifest for backward compatibility
				return Response.redirect(`/plugins/${plugins[0].id}/manifest.json`, 301);
			}

			// 404
			return new Response('Not found', { status: 404, headers });
		} catch (error) {
			console.error('Error:', error);
			return Response.json(
				{
					error: error instanceof Error ? error.message : 'Internal server error'
				},
				{ status: 500, headers }
			);
		}
	}
});

console.log(`\n🚀 Server running on http://localhost:${PORT}`);
console.log(`📋 Plugin list: http://localhost:${PORT}/`);
plugins.forEach((plugin) => {
	console.log(`   • ${plugin.name}: http://localhost:${PORT}/plugins/${plugin.id}/manifest.json`);
});
console.log('');

/**
 * Convert parameter definitions to JSON Schema
 */
function convertParametersToJsonSchema(params: Record<string, any>): any {
	const properties: Record<string, any> = {};
	const required: string[] = [];

	for (const [name, def] of Object.entries(params)) {
		properties[name] = {
			type: def.type,
			description: def.description
		};

		if (def.default !== undefined) {
			properties[name].default = def.default;
		}

		if (def.required) {
			required.push(name);
		}
	}

	return {
		type: 'object',
		properties,
		...(required.length > 0 && { required })
	};
}

/**
 * Wrap widget HTML with base template
 */
function wrapWidgetHtml(content: string, title: string): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${title}</title>
	<link href="https://cdn.jsdelivr.net/npm/daisyui@5.5.14/dist/full.min.css" rel="stylesheet" type="text/css" />
	<script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
	${content}
</body>
</html>
	`.trim();
}
