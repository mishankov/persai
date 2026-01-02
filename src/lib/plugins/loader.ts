import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import type {
	Plugin,
	PluginConfig,
	PluginRegistry,
	RemotePluginManifest,
	PluginTool
} from './types';

export class PluginLoader {
	private plugins = new Map<string, Plugin>();
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
			}

			// Read registry
			const registryContent = readFileSync(this.registryPath, 'utf-8');
			const registry: PluginRegistry = JSON.parse(registryContent);
			this.configs = registry.plugins;

			console.log(`\n🔌 Loading ${this.configs.length} plugin(s)...`);

			// Load each enabled plugin
			for (const config of this.configs) {
				if (!config.enabled) {
					console.log(`⏭️  Skipped: ${config.id} (disabled)`);
					continue;
				}

				try {
					if (config.type === 'local') {
						await this.loadLocalPlugin(config);
					} else {
						await this.loadRemotePlugin(config);
					}
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
	 * Load a local (in-process) plugin
	 */
	private async loadLocalPlugin(config: PluginConfig): Promise<void> {
		if (!config.path) {
			throw new Error(`Local plugin ${config.id} missing path`);
		}

		const pluginPath = join(process.cwd(), config.path);
		const pluginEntryPoint = join(pluginPath, 'index.ts');

		if (!existsSync(pluginEntryPoint)) {
			throw new Error(`Plugin entry point not found: ${pluginEntryPoint}`);
		}

		// Dynamic import (works with Bun and Node.js)
		const module = await import(pluginEntryPoint);
		const plugin: Plugin = module.default;

		// Validate plugin
		if (!plugin) {
			throw new Error(`Plugin ${config.id} did not export a default plugin object`);
		}

		if (plugin.id !== config.id) {
			throw new Error(
				`Plugin ID mismatch: expected ${config.id}, got ${plugin.id}`
			);
		}

		// Call lifecycle hook
		if (plugin.onLoad) {
			await plugin.onLoad();
		}

		this.plugins.set(plugin.id, plugin);
		console.log(
			`✓ ${plugin.name} v${plugin.version} (${plugin.tools?.length || 0} tools, ${plugin.widgets?.length || 0} widgets)`
		);
	}

	/**
	 * Load a remote plugin via HTTP API
	 */
	private async loadRemotePlugin(config: PluginConfig): Promise<void> {
		if (!config.url) {
			throw new Error(`Remote plugin ${config.id} missing url`);
		}

		// Fetch manifest from remote URL
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

			const manifest: RemotePluginManifest = await response.json();

			// Create proxy plugin that calls remote API
			const plugin: Plugin = {
				id: config.id,
				name: manifest.name,
				version: manifest.version,
				description: manifest.description,
				author: manifest.author,
				tools: manifest.tools?.map((tool) => ({
					name: tool.name,
					description: tool.description,
					parameters: this.convertJsonSchemaToZod(tool.parameters),
					execute: async (params: any) => {
						// Call remote API
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
							throw new Error(`Remote tool failed: ${res.status} ${res.statusText}`);
						}

						return res.json();
					}
				})),
				widgets: manifest.widgets?.map((w) => ({
					id: w.id,
					title: w.title,
					description: w.description,
					path: `${config.url}${w.url}` // Full URL for remote widgets
				}))
			};

			this.plugins.set(plugin.id, plugin);
			console.log(
				`✓ ${plugin.name} v${plugin.version} [remote] (${plugin.tools?.length || 0} tools, ${plugin.widgets?.length || 0} widgets)`
			);
		} catch (error) {
			throw new Error(`Failed to fetch remote plugin manifest: ${error}`);
		}
	}

	/**
	 * Convert JSON Schema to Zod schema (simplified)
	 */
	private convertJsonSchemaToZod(jsonSchema: any): z.ZodSchema {
		// For now, accept any object
		// TODO: Implement full JSON Schema to Zod conversion
		return z.any();
	}

	/**
	 * Get a specific plugin by ID
	 */
	getPlugin(id: string): Plugin | undefined {
		return this.plugins.get(id);
	}

	/**
	 * Get all loaded plugins
	 */
	getAllPlugins(): Plugin[] {
		return Array.from(this.plugins.values());
	}

	/**
	 * Get all tools from all loaded plugins
	 */
	getAllTools(): PluginTool[] {
		const tools: PluginTool[] = [];
		for (const plugin of this.plugins.values()) {
			if (plugin.tools) {
				tools.push(...plugin.tools);
			}
		}
		return tools;
	}

	/**
	 * Get all widgets from all loaded plugins
	 */
	getAllWidgets() {
		const widgets: Array<Plugin['widgets'][number] & { pluginId: string }> = [];
		for (const plugin of this.plugins.values()) {
			if (plugin.widgets) {
				widgets.push(
					...plugin.widgets.map((w) => ({
						...w,
						pluginId: plugin.id
					}))
				);
			}
		}
		return widgets;
	}

	/**
	 * Reload all plugins
	 */
	async reload(): Promise<void> {
		// Unload all plugins
		for (const plugin of this.plugins.values()) {
			if (plugin.onUnload) {
				await plugin.onUnload();
			}
		}
		this.plugins.clear();

		// Reload
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
