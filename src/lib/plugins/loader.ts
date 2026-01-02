import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import type { PluginConfig, PluginRegistry, PluginManifest } from './types';

/**
 * Loaded plugin with executable tools
 */
export interface LoadedPlugin {
	id: string;
	name: string;
	version: string;
	description?: string;
	author?: string;
	url: string;
	tools: LoadedTool[];
	widgets: LoadedWidget[];
}

export interface LoadedTool {
	name: string;
	description: string;
	parameters: z.ZodSchema;
	execute: (params: any) => Promise<any>;
}

export interface LoadedWidget {
	id: string;
	title: string;
	description?: string;
	url: string; // Full URL to widget
	pluginId: string;
}

export class PluginLoader {
	private plugins = new Map<string, LoadedPlugin>();
	private configs: PluginConfig[] = [];
	private registryPath: string;

	constructor(registryPath?: string) {
		this.registryPath = registryPath || join(process.cwd(), 'plugins/registry.json');
	}

	/**
	 * Load all enabled plugins from registry
	 */
	async loadPlugins(): Promise<void> {
		try {
			// Check if registry exists
			if (!existsSync(this.registryPath)) {
				console.warn(`Plugin registry not found at ${this.registryPath}`);
				console.log('Creating default registry...');
				await this.createDefaultRegistry();
				return;
			}

			// Read registry
			const registryContent = readFileSync(this.registryPath, 'utf-8');
			const registry: PluginRegistry = JSON.parse(registryContent);
			this.configs = registry.plugins;

			if (this.configs.length === 0) {
				console.log('🔌 No plugins configured');
				return;
			}

			console.log(`\n🔌 Loading ${this.configs.length} plugin(s)...`);

			// Load each enabled plugin
			for (const config of this.configs) {
				if (!config.enabled) {
					console.log(`⏭️  Skipped: ${config.id} (disabled)`);
					continue;
				}

				try {
					await this.loadHttpPlugin(config);
				} catch (error) {
					console.error(`❌ Failed to load plugin ${config.id}:`, error);
				}
			}

			console.log(`\n✅ Loaded ${this.plugins.size} plugin(s)\n`);
		} catch (error) {
			console.error('Failed to load plugin registry:', error);
			throw error;
		}
	}

	/**
	 * Load an HTTP-based plugin
	 */
	private async loadHttpPlugin(config: PluginConfig): Promise<void> {
		if (!config.url) {
			throw new Error(`Plugin ${config.id} missing url`);
		}

		// Fetch manifest from plugin service
		const manifestUrl = `${config.url}/manifest.json`;

		try {
			const response = await fetch(manifestUrl, {
				headers: {
					...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` })
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const manifest: PluginManifest = await response.json();

			// Create loaded plugin with HTTP proxies
			const plugin: LoadedPlugin = {
				id: config.id,
				name: config.name || manifest.name,
				version: config.version || manifest.version,
				description: manifest.description,
				author: manifest.author,
				url: config.url,
				tools: manifest.tools?.map((tool) => ({
					name: tool.name,
					description: tool.description,
					parameters: this.convertJsonSchemaToZod(tool.parameters),
					execute: async (params: any) => {
						// Call remote tool endpoint
						const toolUrl = `${config.url}${tool.endpoint}`;
						const res = await fetch(toolUrl, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` })
							},
							body: JSON.stringify(params)
						});

						if (!res.ok) {
							throw new Error(`Tool ${tool.name} failed: ${res.status} ${res.statusText}`);
						}

						return res.json();
					}
				})) || [],
				widgets: manifest.widgets?.map((w) => ({
					id: w.id,
					title: w.title,
					description: w.description,
					url: `${config.url}${w.url}`, // Full URL to widget
					pluginId: config.id
				})) || []
			};

			this.plugins.set(plugin.id, plugin);
			console.log(
				`✓ ${plugin.name} v${plugin.version} (${plugin.tools.length} tools, ${plugin.widgets.length} widgets)`
			);
		} catch (error) {
			throw new Error(`Failed to fetch manifest from ${manifestUrl}: ${error}`);
		}
	}

	/**
	 * Convert JSON Schema to Zod schema (simplified)
	 * TODO: Implement full JSON Schema to Zod conversion
	 */
	private convertJsonSchemaToZod(jsonSchema: any): z.ZodSchema {
		// For now, accept any params
		// In production, you'd want proper JSON Schema -> Zod conversion
		return z.any();
	}

	/**
	 * Get a specific plugin by ID
	 */
	getPlugin(id: string): LoadedPlugin | undefined {
		return this.plugins.get(id);
	}

	/**
	 * Get all loaded plugins
	 */
	getAllPlugins(): LoadedPlugin[] {
		return Array.from(this.plugins.values());
	}

	/**
	 * Get all tools from all loaded plugins
	 */
	getAllTools(): LoadedTool[] {
		const tools: LoadedTool[] = [];
		for (const plugin of this.plugins.values()) {
			tools.push(...plugin.tools);
		}
		return tools;
	}

	/**
	 * Get all widgets from all loaded plugins
	 */
	getAllWidgets(): LoadedWidget[] {
		const widgets: LoadedWidget[] = [];
		for (const plugin of this.plugins.values()) {
			widgets.push(...plugin.widgets);
		}
		return widgets;
	}

	/**
	 * Reload all plugins
	 */
	async reload(): Promise<void> {
		this.plugins.clear();
		await this.loadPlugins();
	}

	/**
	 * Create default registry file
	 */
	private async createDefaultRegistry(): Promise<void> {
		const { writeFileSync, mkdirSync } = await import('fs');
		const { dirname } = await import('path');

		const registryDir = dirname(this.registryPath);
		if (!existsSync(registryDir)) {
			mkdirSync(registryDir, { recursive: true });
		}

		const defaultRegistry: PluginRegistry = {
			plugins: []
		};

		writeFileSync(this.registryPath, JSON.stringify(defaultRegistry, null, 2));
		console.log(`Created default registry at ${this.registryPath}`);
	}
}

// Singleton instance
export const pluginLoader = new PluginLoader();
