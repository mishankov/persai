/**
 * Plugin manifest structure (returned by GET /manifest.json)
 */
export interface PluginManifest {
	id: string;
	name: string;
	version: string;
	description?: string;
	author?: string;
	tools?: ToolDefinition[];
	widgets?: WidgetDefinition[];
}

/**
 * Tool definition in plugin manifest
 */
export interface ToolDefinition {
	name: string;
	description: string;
	endpoint: string; // e.g., "/api/tools/getGames"
	parameters: any; // JSON Schema
}

/**
 * Widget definition in plugin manifest
 */
export interface WidgetDefinition {
	id: string;
	title: string;
	url: string; // e.g., "/widgets/games"
	description?: string;
}

/**
 * Plugin configuration from registry
 *
 * All plugins are HTTP-based services that expose:
 * - GET /manifest.json - Plugin metadata and capabilities
 * - POST /api/tools/{toolName} - Tool execution endpoints
 * - GET /widgets/{widgetId} - Widget pages (served as HTML/iframe)
 */
export interface PluginConfig {
	id: string;
	enabled: boolean;

	// Plugin service URL
	url: string;

	// Optional API key for authentication
	apiKey?: string;

	// Optional metadata (can override manifest)
	name?: string;
	version?: string;
}

/**
 * Plugin registry configuration file structure
 */
export interface PluginRegistry {
	plugins: PluginConfig[];
}
