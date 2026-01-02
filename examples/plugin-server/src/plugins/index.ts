import type { PluginDefinition } from '../types';

/**
 * Plugin Registry
 *
 * Import and register your plugins here.
 * Plugins can be:
 * - npm packages (@persai-plugins/*)
 * - Local modules (./local-plugin)
 *
 * Example:
 * import rssPlugin from '@persai-plugins/rss';
 * import weatherPlugin from './weather';
 *
 * export const plugins: PluginDefinition[] = [
 *   rssPlugin,
 *   weatherPlugin
 * ];
 */

// Import your plugins here
import examplePlugin from './example';

/**
 * List of all registered plugins
 * Add your imported plugins to this array
 */
export const plugins: PluginDefinition[] = [
	examplePlugin
];

/**
 * Get plugin by ID
 */
export function getPlugin(id: string): PluginDefinition | undefined {
	return plugins.find((p) => p.id === id);
}

/**
 * Get all plugin IDs
 */
export function getPluginIds(): string[] {
	return plugins.map((p) => p.id);
}
