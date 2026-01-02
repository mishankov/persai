# PersAI Plugin Development Guide

Create plugins for PersAI - HTTP-based services that extend the AI's capabilities.

## Overview

PersAI plugins are **standalone HTTP services** that can:
- **Provide AI tools** - Functions the LLM can call
- **Serve widgets** - UI components displayed via iframe
- **Use any technology** - Python, Go, Rust, Bun, whatever you want

## Quick Start

### 1. Create an HTTP Service

```typescript
// server.ts (using Bun)
Bun.serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);

    // Required: Manifest endpoint
    if (url.pathname === '/manifest.json') {
      return Response.json({
        id: 'weather',
        name: 'Weather Plugin',
        version: '1.0.0',
        description: 'Get weather information',
        tools: [
          {
            name: 'getWeather',
            description: 'Get current weather for a city',
            endpoint: '/api/tools/getWeather',
            parameters: {
              type: 'object',
              properties: {
                city: { type: 'string', description: 'City name' }
              },
              required: ['city']
            }
          }
        ],
        widgets: [
          {
            id: 'forecast',
            title: 'Weather Forecast',
            url: '/widgets/forecast'
          }
        ]
      });
    }

    // Tool endpoint
    if (url.pathname === '/api/tools/getWeather') {
      const { city } = await req.json();

      // Your logic here
      const weather = await fetchWeatherData(city);

      return Response.json({
        temperature: weather.temp,
        conditions: weather.conditions
      });
    }

    // Widget endpoint
    if (url.pathname === '/widgets/forecast') {
      return new Response(`
        <html>
          <body>
            <h1>Weather Forecast</h1>
            <div id="forecast"></div>
            <script>
              // Your widget code
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
});

console.log('Weather plugin running on http://localhost:3001');
```

### 2. Test Your Plugin

```bash
# Start your plugin
bun run server.ts

# Test manifest
curl http://localhost:3001/manifest.json

# Test tool
curl -X POST http://localhost:3001/api/tools/getWeather \
  -H "Content-Type: application/json" \
  -d '{"city":"London"}'
```

### 3. Register in PersAI

Edit `plugins/registry.json`:
```json
{
  "plugins": [
    {
      "id": "weather",
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

Your plugin is now available to the AI!

---

## Plugin Manifest

The manifest endpoint (`GET /manifest.json`) describes your plugin:

```typescript
interface PluginManifest {
  id: string;              // Unique identifier
  name: string;            // Display name
  version: string;         // Semantic version
  description?: string;    // What your plugin does
  author?: string;         // Your name
  tools?: ToolDefinition[];
  widgets?: WidgetDefinition[];
}
```

---

## Creating Tools

Tools are functions the AI can call to extend its capabilities.

### Tool Definition

```typescript
interface ToolDefinition {
  name: string;           // Tool identifier
  description: string;    // What it does (AI reads this!)
  endpoint: string;       // POST endpoint path
  parameters: object;     // JSON Schema for parameters
}
```

### Tool Endpoint

Tools receive POST requests:

```
POST /api/tools/{toolName}
Content-Type: application/json

{
  "param1": "value1",
  "param2": "value2"
}
```

Must return JSON:

```json
{
  "result": "any data",
  "status": "success"
}
```

### Example: Multiple Tools

```typescript
const manifest = {
  tools: [
    {
      name: 'searchMovies',
      description: 'Search for movies by title',
      endpoint: '/api/tools/searchMovies',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          year: { type: 'number', optional: true }
        }
      }
    },
    {
      name: 'getMovieDetails',
      description: 'Get detailed information about a movie',
      endpoint: '/api/tools/getMovieDetails',
      parameters: {
        type: 'object',
        properties: {
          movieId: { type: 'string' }
        }
      }
    }
  ]
};

// Handle requests
if (url.pathname === '/api/tools/searchMovies') {
  const { query, year } = await req.json();
  const results = await searchIMDB(query, year);
  return Response.json({ results });
}

if (url.pathname === '/api/tools/getMovieDetails') {
  const { movieId } = await req.json();
  const details = await getMovieInfo(movieId);
  return Response.json(details);
}
```

### Tool Best Practices

✅ **Clear descriptions** - AI uses these to decide when to call your tool
✅ **Validate inputs** - Check parameters before processing
✅ **Error handling** - Return helpful error messages
✅ **Fast responses** - Keep tool execution under 10 seconds when possible
✅ **Structured data** - Return JSON objects, not just strings

---

## Creating Widgets

Widgets are UI components that display data to users.

### Widget Definition

```typescript
interface WidgetDefinition {
  id: string;           // Widget identifier
  title: string;        // Display title
  url: string;          // GET endpoint path
  description?: string;
}
```

### Widget Endpoint

Widgets are HTML pages served via iframe:

```typescript
if (url.pathname === '/widgets/dashboard') {
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dashboard</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .card { border: 1px solid #ccc; padding: 15px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>My Dashboard</h1>
        <div class="card">
          <h2>Statistics</h2>
          <p>Content here</p>
        </div>

        <script>
          // Fetch data and update DOM
          async function loadData() {
            const response = await fetch('/api/data');
            const data = await response.json();
            // Update UI
          }
          loadData();
        </script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}
```

### Widget Frameworks

You can use any framework to build widgets:

**React:**
```typescript
// Serve a React app
if (url.pathname.startsWith('/widgets/')) {
  return serveReactApp();
}
```

**Svelte:**
```typescript
// Build your Svelte app and serve the output
if (url.pathname === '/widgets/mywidget') {
  return Bun.file('./dist/index.html');
}
```

**Plain HTML/JS:**
```typescript
// Just return HTML
return new Response(html, {
  headers: { 'Content-Type': 'text/html' }
});
```

---

## Examples by Language

### Python (Flask)

```python
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

@app.route('/manifest.json')
def manifest():
    return jsonify({
        'id': 'my-plugin',
        'name': 'My Plugin',
        'version': '1.0.0',
        'tools': [{
            'name': 'myTool',
            'description': 'Does something useful',
            'endpoint': '/api/tools/myTool',
            'parameters': {
                'type': 'object',
                'properties': {
                    'input': {'type': 'string'}
                }
            }
        }]
    })

@app.route('/api/tools/myTool', methods=['POST'])
def my_tool():
    data = request.json
    result = process(data['input'])
    return jsonify({'result': result})

@app.route('/widgets/display')
def widget():
    return render_template('widget.html')

if __name__ == '__main__':
    app.run(port=3001)
```

### Go (Standard Library)

```go
package main

import (
    "encoding/json"
    "net/http"
)

type Manifest struct {
    ID      string          `json:"id"`
    Name    string          `json:"name"`
    Version string          `json:"version"`
    Tools   []ToolDef       `json:"tools"`
}

func main() {
    http.HandleFunc("/manifest.json", manifestHandler)
    http.HandleFunc("/api/tools/myTool", toolHandler)
    http.ListenAndServe(":3001", nil)
}

func manifestHandler(w http.ResponseWriter, r *http.Request) {
    manifest := Manifest{
        ID:      "my-plugin",
        Name:    "My Plugin",
        Version: "1.0.0",
        Tools:   []ToolDef{{...}},
    }
    json.NewEncoder(w).Encode(manifest)
}

func toolHandler(w http.ResponseWriter, r *http.Request) {
    var params map[string]interface{}
    json.NewDecoder(r.Body).Decode(&params)

    result := process(params["input"].(string))
    json.NewEncoder(w).Encode(map[string]string{
        "result": result,
    })
}
```

### Rust (Actix-web)

```rust
use actix_web::{web, App, HttpResponse, HttpServer};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct Manifest {
    id: String,
    name: String,
    version: String,
}

async fn manifest() -> HttpResponse {
    let manifest = Manifest {
        id: "my-plugin".to_string(),
        name: "My Plugin".to_string(),
        version: "1.0.0".to_string(),
    };
    HttpResponse::Ok().json(manifest)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/manifest.json", web::get().to(manifest))
            .route("/api/tools/myTool", web::post().to(my_tool))
    })
    .bind("127.0.0.1:3001")?
    .run()
    .await
}
```

---

## Distribution

### Docker

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
EXPOSE 3001
CMD ["bun", "run", "server.ts"]
```

```bash
# Build
docker build -t my-plugin .

# Run
docker run -p 3001:3001 my-plugin

# Publish
docker push yourusername/my-plugin
```

### Docker Compose (for users)

```yaml
version: '3.8'
services:
  persai:
    image: persai/core:latest
    ports:
      - "3000:3000"
    volumes:
      - ./plugins/registry.json:/app/plugins/registry.json

  weather-plugin:
    image: yourusername/weather-plugin:latest
    ports:
      - "3001:3001"

  stocks-plugin:
    image: yourusername/stocks-plugin:latest
    ports:
      - "3002:3002"
```

Users just need to:
1. Run `docker-compose up`
2. Done!

---

## Authentication

Support API keys:

```typescript
Bun.serve({
  async fetch(req) {
    const authHeader = req.headers.get('Authorization');

    if (authHeader !== `Bearer ${process.env.API_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Handle request
  }
});
```

Users configure in registry:
```json
{
  "id": "my-plugin",
  "url": "http://localhost:3001",
  "apiKey": "secret-key-here"
}
```

---

## Testing

### Unit Tests

Test your tool logic:

```typescript
import { expect, test } from 'bun:test';

test('getWeather returns temperature', async () => {
  const result = await getWeather({ city: 'London' });
  expect(result).toHaveProperty('temperature');
});
```

### Integration Tests

Test the HTTP endpoints:

```typescript
test('manifest endpoint works', async () => {
  const response = await fetch('http://localhost:3001/manifest.json');
  const manifest = await response.json();
  expect(manifest.id).toBe('weather');
});

test('tool endpoint works', async () => {
  const response = await fetch('http://localhost:3001/api/tools/getWeather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city: 'London' })
  });
  const result = await response.json();
  expect(result).toHaveProperty('temperature');
});
```

---

## Security

✅ **Validate all inputs** - Don't trust tool parameters
✅ **Rate limiting** - Prevent abuse
✅ **API key support** - For paid/private plugins
✅ **CORS headers** - For widget iframes
✅ **Error handling** - Don't leak sensitive info in errors
✅ **HTTPS in production** - Always use TLS

---

## Best Practices

### Performance
- Cache expensive operations
- Stream large responses when possible
- Keep tool execution under 10 seconds
- Use connection pooling for databases

### Reliability
- Handle errors gracefully
- Provide clear error messages
- Log important events
- Health check endpoint (`/health`)

### User Experience
- Clear tool descriptions
- Helpful error messages
- Fast response times
- Beautiful widgets

---

## Publishing

1. **Create GitHub repo**
2. **Add README** with installation instructions
3. **Publish Docker image**
4. **Share with community**

Example README for users:

```markdown
# Weather Plugin for PersAI

Get weather information in your AI conversations.

## Installation

### Docker

```yaml
# Add to docker-compose.yml
weather-plugin:
  image: yourusername/weather-plugin:latest
  ports:
    - "3001:3001"
  environment:
    - WEATHER_API_KEY=your-key
```

### Registry

```json
{
  "id": "weather",
  "url": "http://weather-plugin:3001",
  "enabled": true
}
```

## API Key

Get a free API key at https://weatherapi.com
```

---

## Support

- **Issues**: GitHub Issues on your plugin repo
- **PersAI Docs**: https://github.com/your-org/persai
- **Examples**: https://github.com/persai-plugins

---

## License

Choose any license for your plugin. MIT is recommended for open source plugins.
