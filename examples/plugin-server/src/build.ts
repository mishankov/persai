#!/usr/bin/env bun
import { compile } from 'svelte/compiler';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { plugins } from './plugins';

const BUILD_DIR = join(import.meta.dir, '../.build/widgets');

console.log('🔨 Building Svelte widgets...\n');

// Clear and create build directory
if (existsSync(BUILD_DIR)) {
	// Remove old build
	const rmrf = (path: string) => {
		if (statSync(path).isDirectory()) {
			readdirSync(path).forEach((file) => rmrf(join(path, file)));
			Bun.spawn(['rm', '-rf', path]);
		}
	};
	rmrf(BUILD_DIR);
}
mkdirSync(BUILD_DIR, { recursive: true });

let totalWidgets = 0;
let compiledWidgets = 0;
let errors = 0;

// Compile all Svelte widgets from all plugins
for (const plugin of plugins) {
	if (!plugin.widgets) continue;

	console.log(`📦 Plugin: ${plugin.name}`);

	for (const [widgetId, widget] of Object.entries(plugin.widgets)) {
		if (!widget.component) {
			console.log(`   ⏭️  ${widgetId} - skipped (HTML render function)`);
			continue;
		}

		totalWidgets++;

		try {
			// Read the Svelte component
			const componentPath = widget.component;
			const source = readFileSync(componentPath, 'utf-8');

			// Compile the component
			const result = compile(source, {
				generate: 'dom',
				hydratable: false,
				css: 'injected'
			});

			// Create output structure
			const output = {
				js: result.js.code,
				css: result.css?.code,
				props: widget.props || {}
			};

			// Save to build directory
			const outputPath = join(BUILD_DIR, `${plugin.id}-${widgetId}.json`);
			writeFileSync(outputPath, JSON.stringify(output, null, 2));

			compiledWidgets++;
			console.log(`   ✅ ${widgetId} - compiled`);
		} catch (error) {
			errors++;
			console.error(`   ❌ ${widgetId} - failed:`);
			console.error(`      ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}

console.log(`\n✨ Build complete!`);
console.log(`   Total widgets: ${totalWidgets}`);
console.log(`   Compiled: ${compiledWidgets}`);
console.log(`   Errors: ${errors}`);

if (errors > 0) {
	console.error('\n❌ Build failed with errors');
	process.exit(1);
}

console.log(`\n📁 Output: ${relative(process.cwd(), BUILD_DIR)}`);
