# PersAI Plugin Development Guide

This guide explains how to create plugins for PersAI, a self-hosted personal AI assistant.

## Overview

PersAI supports a flexible plugin system that allows third-party developers to extend the AI's capabilities with:
- **AI Tools**: Functions the LLM can call to fetch data or perform actions
- **Widgets**: UI components to display data to users
- **Lifecycle Hooks**: Code that runs when plugins load/unload

## Plugin Types

### 1. Local Plugins (In-Process)
- Written in TypeScript/JavaScript (Bun/Node.js compatible)
- Run in the same process as PersAI
- Fast, no network overhead
- **Best for**: Lightweight tools, data transformations, simple API calls

### 2. External Service Plugins
- Separate HTTP service (any language)
- Communicate via REST API
- **Best for**: Heavy computations, different tech stacks, isolated services

### 3. Remote/SaaS Plugins
- Hosted by third parties
- Users connect via API key
- **Best for**: Paid services, managed infrastructure

## Creating a Local Plugin

### Quick Start

1. **Copy the template:**
   ```bash
   cp -r plugins/TEMPLATE plugins/my-plugin
   cd plugins/my-plugin
   ```

2. **Edit `package.json`:**
   ```json
   {
     "name": "@persai-plugins/my-plugin",
     "version": "1.0.0",
     "description": "My awesome plugin",
     "author": "Your Name"
   }
   ```

3. **Edit `index.ts`:**
   ```typescript
   import { z } from 'zod';
   import type { Plugin } from '../../src/lib/plugins/types';

   const myPlugin: Plugin = {
     id: 'my-plugin',
     name: 'My Plugin',
     version: '1.0.0',

     tools: [
       {
         name: 'myTool',
         description: 'What this tool does',
         parameters: z.object({
           input: z.string()
         }),
         execute: async ({ input }) => {
           // Your logic here
           return { result: 'success' };
         }
       }
     ]
   };

   export default myPlugin;
   ```

4. **Register the plugin:**
   Edit `plugins/registry.json`:
   ```json
   {
     "plugins": [
       {
         "id": "my-plugin",
         "type": "local",
         "path": "./plugins/my-plugin",
         "enabled": true
       }
     ]
   }
   ```

5. **Restart PersAI:**
   ```bash
   bun run dev
   ```

## Plugin Structure

### Directory Layout

```
plugins/my-plugin/
├── package.json           # Plugin metadata
├── index.ts              # Plugin entry point (required)
├── tools.ts              # Tool definitions (optional)
├── api.ts                # API clients (optional)
└── routes/               # Widget routes (optional)
    └── widget/
        └── +page.svelte
```

### Plugin Interface

```typescript
interface Plugin {
  // Required
  id: string;                    // Unique identifier
  name: string;                  // Display name
  version: string;               // Semantic version

  // Optional
  description?: string;
  author?: string;
  tools?: PluginTool[];
  widgets?: PluginWidget[];
  onLoad?: () => Promise<void> | void;
  onUnload?: () => Promise<void> | void;
}
```

## Creating AI Tools

Tools are functions the LLM can call to extend its capabilities.

### Tool Interface

```typescript
interface PluginTool {
  name: string;                  // Unique tool name
  description: string;           // What the tool does (AI reads this)
  parameters: z.ZodSchema;       // Zod schema for parameters
  execute: (params: any) => Promise<any>;  // Tool implementation
}
```

### Example: Weather Tool

```typescript
import { z } from 'zod';

const weatherTool: PluginTool = {
  name: 'getWeather',
  description: 'Get current weather for a city',
  parameters: z.object({
    city: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).optional()
  }),
  execute: async ({ city, units = 'celsius' }) => {
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await fetch(
      `https://api.weather.com/v1/current?city=${city}&units=${units}&key=${apiKey}`
    );
    const data = await response.json();

    return {
      temperature: data.temp,
      conditions: data.conditions,
      humidity: data.humidity
    };
  }
};
```

### Tool Best Practices

1. **Clear descriptions**: The AI uses these to decide when to call your tool
2. **Validate inputs**: Use Zod schemas to ensure correct parameters
3. **Error handling**: Return useful error messages
4. **Return structured data**: Use objects, not just strings
5. **Log calls**: Use `console.log()` for debugging

## Creating Widgets

Widgets are UI components that display data to users.

### Widget Interface

```typescript
interface PluginWidget {
  id: string;                    // Unique widget identifier
  title: string;                 // Display title
  description?: string;
  path: string;                  // Relative path to .svelte file
}
```

### Example Widget

```typescript
// In your plugin's index.ts
widgets: [
  {
    id: 'weather-display',
    title: 'Weather',
    description: 'Current weather conditions',
    path: './routes/weather/+page.svelte'
  }
]
```

### Widget Component

Create `routes/weather/+page.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let weather = $state(null);
  let loading = $state(true);

  const isWidget = $derived($page.url.searchParams.get('target') === 'widget');

  onMount(async () => {
    const response = await fetch('/api/weather');
    weather = await response.json();
    loading = false;
  });
</script>

{#if isWidget}
  <!-- Compact widget view -->
  <div class="p-2">
    <div class="text-sm">{weather?.temp}°C</div>
  </div>
{:else}
  <!-- Full-screen view -->
  <div class="container mx-auto p-4">
    <h1>Weather</h1>
    <div class="text-2xl">{weather?.temp}°C</div>
  </div>
{/if}
```

### Showing Widgets

Create a tool that returns a widget link:

```typescript
{
  name: 'showWeather',
  description: 'Display weather widget',
  parameters: z.object({}),
  execute: async () => {
    return { link: '/external/weather/display' };
  }
}
```

## Lifecycle Hooks

### onLoad

Called when the plugin is loaded:

```typescript
onLoad: async () => {
  console.log('Plugin loaded');
  // Initialize database connections
  // Start background tasks
  // Validate configuration
}
```

### onUnload

Called when the plugin is unloaded:

```typescript
onUnload: async () => {
  console.log('Plugin unloaded');
  // Close connections
  // Stop background tasks
  // Cleanup resources
}
```

## Creating External Service Plugins

For plugins in other languages (Python, Go, Rust, etc.), create an HTTP service.

### Service Requirements

1. **Manifest endpoint**: `GET /manifest.json`
2. **Tool endpoints**: As defined in manifest

### Manifest Format

```json
{
  "id": "my-service",
  "name": "My Service Plugin",
  "version": "1.0.0",
  "description": "Does cool things",
  "tools": [
    {
      "name": "myTool",
      "description": "What it does",
      "endpoint": "/api/tools/my-tool",
      "parameters": {
        "type": "object",
        "properties": {
          "input": { "type": "string" }
        }
      }
    }
  ],
  "widgets": [
    {
      "id": "my-widget",
      "title": "My Widget",
      "url": "/widget/display"
    }
  ]
}
```

### Tool Endpoint

```python
# Example in Python/Flask
@app.post('/api/tools/my-tool')
def my_tool():
    data = request.json
    input_value = data.get('input')

    # Your logic here
    result = process(input_value)

    return jsonify({'result': result})
```

### Registry Configuration

```json
{
  "plugins": [
    {
      "id": "my-service",
      "type": "external",
      "url": "http://localhost:3001",
      "enabled": true
    }
  ]
}
```

## Distribution

### As NPM Package

1. **Publish to npm:**
   ```bash
   npm publish
   ```

2. **Users install:**
   ```bash
   cd plugins
   bun add @your-org/your-plugin
   ```

### As Git Repository

Users clone into `plugins/`:
```bash
cd plugins
git clone https://github.com/you/your-plugin
```

### As Docker Image

For external services:

```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
CMD ["node", "server.js"]
```

Users run:
```bash
docker run -p 3001:3001 your/plugin-service
```

## Testing

### Test Your Plugin

```typescript
// test.ts
import myPlugin from './index';

// Test tool execution
const result = await myPlugin.tools[0].execute({ input: 'test' });
console.log('Result:', result);
```

Run:
```bash
bun run test.ts
```

### Integration Testing

Start PersAI and verify:
1. Plugin loads without errors
2. Tools appear in AI conversation
3. Tools execute correctly
4. Widgets render properly

## Security Considerations

1. **Validate all inputs** with Zod schemas
2. **Sanitize user data** before using in queries
3. **Use environment variables** for API keys
4. **Rate limit** external API calls
5. **Handle errors gracefully**
6. **Don't expose sensitive data** in tool responses

## Examples

See these plugins for reference:
- `plugins/nba/` - Full-featured plugin with tools and widgets
- `plugins/TEMPLATE/` - Starter template

## Plugin Registry

To make your plugin discoverable:
1. Tag your repo with `persai-plugin`
2. Add to npm with keyword `persai-plugin`
3. Submit to community plugin list (coming soon)

## Support

- **Issues**: https://github.com/your-org/persai/issues
- **Discussions**: https://github.com/your-org/persai/discussions
- **Docs**: https://persai.dev/docs

## License

Plugins can use any license. MIT is recommended for open-source plugins.
