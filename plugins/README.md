# PersAI Plugins

Plugins for PersAI are **HTTP-based services** that run as separate applications.

## Architecture

Each plugin is a standalone HTTP service that exposes:
- `GET /manifest.json` - Plugin metadata and capabilities
- `POST /api/tools/{toolName}` - Tool execution endpoints
- `GET /widgets/{widgetId}` - Widget pages (HTML/iframe)

## Plugin Registry

Edit `registry.json` to configure plugins:

```json
{
  "plugins": [
    {
      "id": "my-plugin",
      "enabled": true,
      "url": "http://localhost:3001",
      "apiKey": "optional-api-key"
    }
  ]
}
```

## Creating a Plugin

### 1. Create HTTP Service

Any language/framework works! Here's a minimal example with Bun:

```typescript
// server.ts
Bun.serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);

    // Manifest endpoint
    if (url.pathname === '/manifest.json') {
      return Response.json({
        id: 'my-plugin',
        name: 'My Plugin',
        version: '1.0.0',
        tools: [
          {
            name: 'myTool',
            description: 'What this tool does',
            endpoint: '/api/tools/myTool',
            parameters: {
              type: 'object',
              properties: {
                input: { type: 'string' }
              }
            }
          }
        ],
        widgets: [
          {
            id: 'my-widget',
            title: 'My Widget',
            url: '/widgets/display'
          }
        ]
      });
    }

    // Tool endpoint
    if (url.pathname === '/api/tools/myTool') {
      const params = await req.json();
      return Response.json({
        result: `Processed: ${params.input}`
      });
    }

    // Widget endpoint
    if (url.pathname === '/widgets/display') {
      return new Response(`
        <html>
          <body>
            <h1>My Widget</h1>
            <p>This is an iframe widget!</p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
});
```

### 2. Run Your Plugin

```bash
bun run server.ts
```

### 3. Register in PersAI

Edit `plugins/registry.json`:
```json
{
  "plugins": [
    {
      "id": "my-plugin",
      "enabled": true,
      "url": "http://localhost:3001"
    }
  ]
}
```

### 4. Restart PersAI

```bash
bun run dev
```

## Distribution

### Docker

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY . .
EXPOSE 3001
CMD ["bun", "run", "server.ts"]
```

```bash
docker build -t my-plugin .
docker run -p 3001:3001 my-plugin
```

### Docker Compose

```yaml
version: '3.8'
services:
  persai:
    image: persai/core:latest
    ports:
      - "3000:3000"

  my-plugin:
    image: my-plugin:latest
    ports:
      - "3001:3001"
```

## Manifest Schema

```typescript
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  tools?: ToolDefinition[];
  widgets?: WidgetDefinition[];
}

interface ToolDefinition {
  name: string;
  description: string;  // AI uses this to decide when to call
  endpoint: string;     // POST endpoint
  parameters: any;      // JSON Schema
}

interface WidgetDefinition {
  id: string;
  title: string;
  url: string;          // GET endpoint returning HTML
  description?: string;
}
```

## Tool Execution

Tools receive POST requests with JSON parameters:

```typescript
// Request
POST /api/tools/myTool
Content-Type: application/json

{
  "input": "user data"
}

// Response
{
  "result": "processed data"
}
```

## Widgets

Widgets are HTML pages embedded in iframes:

```typescript
// Request
GET /widgets/my-widget

// Response
<html>
  <body>
    <div>Widget content</div>
  </body>
</html>
```

## Examples

See example plugins:
- Coming soon!

## Benefits

✅ **Any language/framework** - Python, Go, Rust, Node, Bun, etc.
✅ **True isolation** - Separate processes
✅ **Independent scaling** - Scale plugins separately
✅ **Easy distribution** - Docker images
✅ **No rebuild needed** - Just edit registry.json
✅ **Self-contained** - Each plugin is complete

## For Plugin Developers

Full documentation: [PLUGIN_DEVELOPMENT.md](../PLUGIN_DEVELOPMENT.md)
