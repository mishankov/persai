/**
 * Plugin interface for PersAI plugin server
 */

export interface PluginDefinition {
	id: string;
	name: string;
	version: string;
	description?: string;
	author?: string;
	tools?: Record<string, PluginTool>;
	widgets?: Record<string, PluginWidget>;
}

export interface PluginTool {
	description: string;
	parameters?: Record<string, ParameterDefinition>;
	execute: (params: any) => Promise<any>;
}

export interface ParameterDefinition {
	type: 'string' | 'number' | 'boolean' | 'object' | 'array';
	description?: string;
	required?: boolean;
	default?: any;
}

export interface PluginWidget {
	title: string;
	description?: string;
	render: (data?: any) => string | Promise<string>;
}

/**
 * Manifest format for PersAI
 */
export interface PluginManifest {
	id: string;
	name: string;
	version: string;
	description?: string;
	author?: string;
	tools?: ToolManifest[];
	widgets?: WidgetManifest[];
}

export interface ToolManifest {
	name: string;
	description: string;
	endpoint: string;
	parameters: any; // JSON Schema
}

export interface WidgetManifest {
	id: string;
	title: string;
	url: string;
	description?: string;
}
