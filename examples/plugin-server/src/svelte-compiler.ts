import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CompiledWidget {
	js: string;
	css?: string;
	props?: Record<string, any>;
}

const BUILD_DIR = join(import.meta.dir, '../.build/widgets');
const compiledCache = new Map<string, CompiledWidget>();

/**
 * Load a pre-compiled Svelte widget
 */
export async function loadCompiledWidget(
	pluginId: string,
	widgetId: string,
	props?: Record<string, any>
): Promise<string> {
	const cacheKey = `${pluginId}-${widgetId}`;

	// Check cache first
	if (!compiledCache.has(cacheKey)) {
		// Load from build directory
		const buildPath = join(BUILD_DIR, `${cacheKey}.json`);

		if (!existsSync(buildPath)) {
			throw new Error(
				`Widget not found: ${pluginId}/${widgetId}. Did you run 'bun run build'?`
			);
		}

		try {
			const data = readFileSync(buildPath, 'utf-8');
			const compiled: CompiledWidget = JSON.parse(data);
			compiledCache.set(cacheKey, compiled);
		} catch (error) {
			console.error(`Error loading compiled widget ${cacheKey}:`, error);
			throw error;
		}
	}

	const compiled = compiledCache.get(cacheKey)!;

	// Merge props (runtime props override build-time props)
	const mergedProps = { ...compiled.props, ...props };

	return generateWidgetHtml(compiled, mergedProps);
}

/**
 * Generate HTML that includes the compiled Svelte component
 */
function generateWidgetHtml(compiled: CompiledWidget, props?: Record<string, any>): string {
	const propsJson = JSON.stringify(props || {});

	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="https://cdn.jsdelivr.net/npm/daisyui@5.5.14/dist/full.min.css" rel="stylesheet" type="text/css" />
	<script src="https://cdn.tailwindcss.com"></script>
	${compiled.css ? `<style>${compiled.css}</style>` : ''}
</head>
<body>
	<div id="app"></div>
	<script type="module">
		${compiled.js}

		// Mount the component
		const props = ${propsJson};
		new Component({
			target: document.getElementById('app'),
			props: props
		});
	</script>
</body>
</html>
	`.trim();
}

/**
 * Clear the compilation cache
 */
export function clearCompilationCache(): void {
	compiledCache.clear();
}
