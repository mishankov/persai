import type { z } from 'zod';

/**
 * Plugin definition interface
 */
export interface Plugin {
	id: string;
	name: string;
	version: string;
	description?: string;
	author?: string;

	// AI Tools provided by the plugin
	tools?: PluginTool[];

	// Widgets provided by the plugin
	widgets?: PluginWidget[];

	// Lifecycle hooks
	onLoad?: () => Promise<void> | void;
	onUnload?: () => Promise<void> | void;
}

/**
 * Tool definition for AI integration
 */
export interface PluginTool {
	name: string;
	description: string;
	parameters: z.ZodSchema;
	execute: (params: any) => Promise<any>;
}

/**
 * Widget definition for UI components
 *
 * IMPORTANT for local plugins:
 * - Svelte widget files MUST be in src/routes/external/[plugin-id]/
 * - The 'path' field should be the route path (e.g., '/external/nba/games')
 * - Widgets cannot live in the plugins/ directory (SvelteKit limitation)
 *
 * For external/remote plugins:
 * - The 'path' is the full URL to the widget (e.g., 'http://service:3001/widget')
 */
export interface PluginWidget {
	id: string;
	title: string;
	description?: string;
	path: string; // For local: route path (/external/...), for remote: full URL
}

/**
 * Plugin configuration from registry
 */
export interface PluginConfig {
	id: string;
	type: 'local' | 'external' | 'remote';
	enabled: boolean;

	// For local plugins
	path?: string;

	// For external/remote plugins
	url?: string;
	apiKey?: string;

	// Optional metadata
	name?: string;
	version?: string;
}

/**
 * Plugin registry configuration file structure
 */
export interface PluginRegistry {
	plugins: PluginConfig[];
}

/**
 * Remote plugin manifest structure
 */
export interface RemotePluginManifest {
	id: string;
	name: string;
	version: string;
	description?: string;
	author?: string;
	tools?: RemoteToolDefinition[];
	widgets?: RemoteWidgetDefinition[];
}

export interface RemoteToolDefinition {
	name: string;
	description: string;
	endpoint: string;
	parameters: any; // JSON schema
}

export interface RemoteWidgetDefinition {
	id: string;
	title: string;
	url: string;
	description?: string;
}
