# PersAI Plugin Server

A lightweight Bun + Svelte plugin server for PersAI. Host multiple plugins in a single application!

## Features

✅ **Multiple plugins in one server** - Install plugins as npm packages
✅ **Bun runtime** - Fast and lightweight
✅ **Svelte support** - Use Svelte components for widgets (optional)
✅ **Tailwind CSS + DaisyUI** - Pre-configured styling
✅ **TypeScript** - Full type safety
✅ **Zero build for development** - Bun runs TS directly
✅ **Simple plugin interface** - Easy to create new plugins

## Quick Start

### 1. Install Dependencies

```bash
cd examples/plugin-server
bun install
```

### 2. Run the Server

```bash
bun run dev
```

Server runs on `http://localhost:4444`

### 3. Test It

```bash
# List plugins
curl http://localhost:4444/

# Get plugin manifest
curl http://localhost:4444/plugins/example/manifest.json

# Call a tool
curl -X POST http://localhost:4444/plugins/example/tools/echo \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello!"}'

# View widget
open http://localhost:4444/plugins/example/widgets/display
```

## Creating a Plugin

### Option 1: Local Plugin (in this project)

Create a new file in `src/plugins/`:

```typescript
// src/plugins/my-plugin.ts
import type { PluginDefinition } from '../types';

const myPlugin: PluginDefinition = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',

  tools: {
    myTool: {
      description: 'What this tool does',
      parameters: {
        input: {
          type: 'string',
          description: 'Input parameter',
          required: true
        }
      },
      execute: async ({ input }) => {
        // Your logic here
        return { result: `Processed: ${input}` };
      }
    }
  },

  widgets: {
    display: {
      title: 'My Widget',
      render: async () => {
        return `
          <div class="p-4">
            <h1 class="text-2xl font-bold">My Widget</h1>
            <p>Widget content here</p>
          </div>
        `;
      }
    }
  }
};

export default myPlugin;
```

Register it in `src/plugins/index.ts`:

```typescript
import myPlugin from './my-plugin';

export const plugins: PluginDefinition[] = [
  myPlugin  // Add your plugin here
];
```

### Option 2: NPM Package

Create a separate package:

```bash
# Create plugin package
mkdir my-plugin
cd my-plugin
bun init
```

```typescript
// index.ts
export default {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  tools: { /* ... */ },
  widgets: { /* ... */ }
};
```

Install and register:

```bash
# In plugin-server directory
bun add ../my-plugin

# In src/plugins/index.ts
import myPlugin from 'my-plugin';
export const plugins = [myPlugin];
```

## Plugin Interface

### PluginDefinition

```typescript
interface PluginDefinition {
  id: string;                              // Unique identifier
  name: string;                            // Display name
  version: string;                         // Semantic version
  description?: string;                    // Plugin description
  author?: string;                         // Your name
  tools?: Record<string, PluginTool>;      // AI tools
  widgets?: Record<string, PluginWidget>;  // UI widgets
}
```

### Tools

```typescript
interface PluginTool {
  description: string;                     // What the tool does (AI reads this!)
  parameters?: Record<string, {            // Tool parameters
    type: 'string' | 'number' | 'boolean' | 'object';
    description?: string;
    required?: boolean;
    default?: any;
  }>;
  execute: (params: any) => Promise<any>;  // Tool implementation
}
```

**Example:**

```typescript
tools: {
  fetchData: {
    description: 'Fetch data from an API',
    parameters: {
      url: {
        type: 'string',
        description: 'API endpoint URL',
        required: true
      },
      method: {
        type: 'string',
        description: 'HTTP method',
        default: 'GET'
      }
    },
    execute: async ({ url, method = 'GET' }) => {
      const response = await fetch(url, { method });
      return await response.json();
    }
  }
}
```

### Widgets

```typescript
interface PluginWidget {
  title: string;                           // Widget title
  description?: string;                    // Widget description
  render: (data?: any) => string | Promise<string>;  // Render function
}
```

**Example:**

```typescript
widgets: {
  dashboard: {
    title: 'Dashboard',
    description: 'Main dashboard view',
    render: async () => {
      const data = await fetchDashboardData();

      return `
        <div class="container mx-auto p-4">
          <h1 class="text-3xl font-bold mb-4">Dashboard</h1>
          <div class="grid grid-cols-3 gap-4">
            ${data.map(item => `
              <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                  <h2 class="card-title">${item.title}</h2>
                  <p>${item.description}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }
}
```

### Using Tailwind + DaisyUI

Widgets automatically have Tailwind CSS and DaisyUI available:

```typescript
render: async () => {
  return `
    <div class="hero min-h-screen bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">Hello!</h1>
          <p class="py-6">Beautiful widgets with DaisyUI</p>
          <button class="btn btn-primary">Get Started</button>
        </div>
      </div>
    </div>
  `;
}
```

See [DaisyUI components](https://daisyui.com/components/) for available components.

## Project Structure

```
plugin-server/
├── src/
│   ├── server.ts              # Main server
│   ├── types.ts               # TypeScript types
│   └── plugins/
│       ├── index.ts           # Plugin registry
│       └── example.ts         # Example plugin
├── package.json
├── tailwind.config.js         # Tailwind configuration
└── README.md
```

## API Endpoints

### List All Plugins

```
GET /
```

Returns list of all loaded plugins.

### Plugin Manifest

```
GET /plugins/{pluginId}/manifest.json
```

Returns plugin metadata in PersAI format.

### Execute Tool

```
POST /plugins/{pluginId}/tools/{toolName}
Content-Type: application/json

{
  "param1": "value1",
  "param2": "value2"
}
```

Executes a plugin tool and returns the result.

### Render Widget

```
GET /plugins/{pluginId}/widgets/{widgetId}
```

Returns HTML widget.

### Health Check

```
GET /health
```

Returns server health status.

## Configuration

### Change Port

```bash
PORT=8080 bun run dev
```

Or set in your environment:

```bash
export PORT=8080
bun run dev
```

### Add CORS Origins

Edit `src/server.ts` to customize CORS headers:

```typescript
const headers = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  // ...
};
```

## Examples

### RSS Feed Plugin

```typescript
// src/plugins/rss.ts
import Parser from 'rss-parser';

const rssPlugin: PluginDefinition = {
  id: 'rss',
  name: 'RSS Feed Reader',
  version: '1.0.0',

  tools: {
    getFeed: {
      description: 'Get latest items from an RSS feed',
      parameters: {
        url: {
          type: 'string',
          description: 'RSS feed URL',
          required: true
        },
        limit: {
          type: 'number',
          description: 'Number of items to return',
          default: 10
        }
      },
      execute: async ({ url, limit = 10 }) => {
        const parser = new Parser();
        const feed = await parser.parseURL(url);
        return {
          title: feed.title,
          items: feed.items.slice(0, limit)
        };
      }
    }
  },

  widgets: {
    feedDisplay: {
      title: 'RSS Feed',
      render: async () => {
        const feed = await getFeedData();

        return `
          <div class="container mx-auto p-4">
            <h1 class="text-3xl font-bold mb-4">${feed.title}</h1>
            <div class="space-y-4">
              ${feed.items.map(item => `
                <div class="card bg-base-100 shadow-xl">
                  <div class="card-body">
                    <h2 class="card-title">${item.title}</h2>
                    <p>${item.contentSnippet}</p>
                    <div class="card-actions justify-end">
                      <a href="${item.link}" class="btn btn-primary btn-sm">
                        Read More
                      </a>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }
  }
};

export default rssPlugin;
```

### Weather Plugin

```typescript
// src/plugins/weather.ts
const weatherPlugin: PluginDefinition = {
  id: 'weather',
  name: 'Weather',
  version: '1.0.0',

  tools: {
    getWeather: {
      description: 'Get current weather for a city',
      parameters: {
        city: {
          type: 'string',
          description: 'City name',
          required: true
        }
      },
      execute: async ({ city }) => {
        const apiKey = process.env.WEATHER_API_KEY;
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`
        );
        const data = await response.json();

        return {
          location: data.location.name,
          temperature: data.current.temp_c,
          condition: data.current.condition.text,
          humidity: data.current.humidity
        };
      }
    }
  },

  widgets: {
    current: {
      title: 'Current Weather',
      render: async () => {
        const weather = await getCurrentWeather();

        return `
          <div class="hero min-h-screen" style="background-image: url(${weather.background});">
            <div class="hero-overlay bg-opacity-60"></div>
            <div class="hero-content text-center text-neutral-content">
              <div class="max-w-md">
                <h1 class="mb-5 text-5xl font-bold">${weather.location}</h1>
                <p class="mb-5 text-6xl">${weather.temperature}°C</p>
                <p class="mb-5 text-2xl">${weather.condition}</p>
              </div>
            </div>
          </div>
        `;
      }
    }
  }
};
```

## Deployment

### Docker

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
EXPOSE 4444
CMD ["bun", "run", "src/server.ts"]
```

```bash
docker build -t plugin-server .
docker run -p 4444:4444 plugin-server
```

### Production Build

```bash
bun run build
bun run start
```

## Connecting to PersAI

Register this server in PersAI's `plugins/registry.json`:

```json
{
  "plugins": [
    {
      "id": "plugin-server",
      "url": "http://localhost:4444",
      "enabled": true
    }
  ]
}
```

**Note:** The plugin server can host multiple plugins, but PersAI will load them all through the base URL. Each plugin is accessible at `/plugins/{id}/manifest.json`.

## Tips

### Hot Reload

Bun automatically restarts on file changes in dev mode!

### Debugging

```typescript
tools: {
  myTool: {
    execute: async (params) => {
      console.log('Tool called with:', params);  // Logs appear in terminal
      // ...
    }
  }
}
```

### Error Handling

```typescript
tools: {
  myTool: {
    execute: async (params) => {
      try {
        const result = await riskyOperation(params);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
  }
}
```

## License

MIT
