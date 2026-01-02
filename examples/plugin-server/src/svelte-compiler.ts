import { compile } from 'svelte/compiler';
import { readFileSync } from 'fs';
import { join } from 'path';

interface CompiledWidget {
	js: string;
	css?: string;
}

const compiledCache = new Map<string, CompiledWidget>();

/**
 * Compile a Svelte component to JavaScript
 */
export async function compileSvelteComponent(
	componentPath: string,
	props?: Record<string, any>
): Promise<string> {
	const cacheKey = `${componentPath}:${JSON.stringify(props || {})}`;

	// Check cache first
	if (compiledCache.has(cacheKey)) {
		const cached = compiledCache.get(cacheKey)!;
		return generateWidgetHtml(cached, props);
	}

	try {
		// Read the Svelte component file
		const source = readFileSync(componentPath, 'utf-8');

		// Compile the component
		const result = compile(source, {
			generate: 'dom',
			hydratable: false,
			css: 'injected'
		});

		const compiled: CompiledWidget = {
			js: result.js.code,
			css: result.css?.code
		};

		// Cache the compiled result
		compiledCache.set(cacheKey, compiled);

		return generateWidgetHtml(compiled, props);
	} catch (error) {
		console.error(`Error compiling Svelte component ${componentPath}:`, error);
		throw error;
	}
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
