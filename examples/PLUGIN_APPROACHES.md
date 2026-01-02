# PersAI Plugin Development Approaches

PersAI supports two approaches for creating plugins, each suited to different use cases.

## Approach 1: Plugin Server (Recommended for Simple Plugins)

**Location**: `examples/plugin-server/`

**Best for**:
- Simple plugins with basic tools and widgets
- Quick prototyping
- Hosting multiple plugins in one server
- Minimal boilerplate

**How it works**:
- Bun + Svelte (not SvelteKit) server
- Plugins installed as npm packages
- Simple object-based interface
- Pre-configured Tailwind + DaisyUI

**Example plugin**:
```typescript
const myPlugin: PluginDefinition = {
  id: 'rss',
  name: 'RSS Reader',
  version: '1.0.0',

  tools: {
    getFeed: {
      description: 'Get RSS feed',
      parameters: { url: { type: 'string', required: true } },
      execute: async ({ url }) => {
        // Fetch and parse RSS
        return { items: [...] };
      }
    }
  },

  widgets: {
    display: {
      title: 'RSS Feed',
      render: async () => {
        return `<div class="card">...</div>`;
      }
    }
  }
};
```

**Quick start**:
```bash
cd examples/plugin-server
bun install
bun run dev
```

**Pros**:
- ✅ Minimal boilerplate
- ✅ Host multiple plugins in one server
- ✅ Simple object interface
- ✅ Fast development
- ✅ Tailwind + DaisyUI included

**Cons**:
- ❌ Limited to HTML string widgets (no reactive components)
- ❌ All plugins share the same server process
- ❌ Less control over build process

## Approach 2: Full Application (For Complex Plugins)

**Location**: `examples/nba-plugin/` or `example-plugins/nbakit/`

**Best for**:
- Complex plugins with advanced features
- Custom build requirements
- Full control over architecture
- Reactive UI components (SvelteKit)

**How it works**:
- Complete standalone application
- Any language/framework (Bun, Node.js, Python, Go, etc.)
- Must satisfy HTTP plugin contract
- Full control over dependencies

**Example structure**:
```
my-plugin/
├── src/
│   ├── routes/          # SvelteKit routes (if using SvelteKit)
│   └── lib/             # Plugin logic
├── package.json
├── svelte.config.js
├── Dockerfile
└── README.md
```

**Quick start**:
```bash
# Using nba-plugin example
cd examples/nba-plugin
bun install
bun run dev

# Or using nbakit example (SvelteKit)
cd example-plugins/nbakit
bun install
bun run dev
```

**Pros**:
- ✅ Full framework features (reactive components, routing, etc.)
- ✅ Complete control over architecture
- ✅ Can use any language/framework
- ✅ Independent deployment

**Cons**:
- ❌ More boilerplate code
- ❌ Requires separate server process
- ❌ Longer setup time

## HTTP Plugin Contract

Both approaches must implement the same HTTP endpoints:

### Manifest
```
GET /manifest.json
```

Returns plugin metadata with tools and widgets.

### Tools
```
POST /api/tools/{toolName}
Content-Type: application/json

{ "param": "value" }
```

Executes a tool and returns results.

### Widgets
```
GET /widgets/{widgetId}
```

Returns HTML widget.

## Choosing an Approach

**Use Plugin Server if**:
- Creating simple tools (API wrappers, data fetchers, etc.)
- Building basic widgets (dashboards, displays, forms)
- Want to prototype quickly
- Don't need reactive UI components
- Want to host multiple plugins together

**Use Full Application if**:
- Need reactive UI components (Svelte, React, etc.)
- Require complex build processes
- Want full control over dependencies
- Need custom server configuration
- Building a large, complex plugin

## Examples

### Simple Plugins (Plugin Server)
- RSS feed reader
- Weather widget
- Todo list
- Calculator
- Time tracker

### Complex Plugins (Full Application)
- **NBA Games** (`examples/nba-plugin/`) - ESPN API integration
- **NBA Kit** (`example-plugins/nbakit/`) - Full SvelteKit app
- Video streaming dashboard
- Real-time chat widget
- Data visualization dashboard

## Installation to PersAI

Both approaches register the same way in `plugins/registry.json`:

```json
{
  "plugins": [
    {
      "id": "my-plugin",
      "url": "http://localhost:4444",
      "enabled": true,
      "name": "My Plugin",
      "version": "1.0.0"
    }
  ]
}
```

## Docker Deployment

### Plugin Server
```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
EXPOSE 4444
CMD ["bun", "run", "src/server.ts"]
```

### Full Application
```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
RUN bun run build
EXPOSE 3001
CMD ["bun", "run", "start"]
```

## Documentation

- **Plugin Server**: See `examples/plugin-server/README.md`
- **HTTP Plugins**: See `PLUGIN_DEVELOPMENT.md`
- **NBA Example**: See `examples/nba-plugin/README.md`
