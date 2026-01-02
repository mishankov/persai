# PersAI - Personal AI Assistant

A self-hosted conversational AI application with a flexible plugin system. PersAI combines powerful LLM capabilities with extensible tools and widgets.

## Features

- 🤖 **Multi-LLM Support**: Choose from DeepSeek, Yandex GPT, Ollama, OpenRouter models, and more
- 🔌 **Plugin System**: Extend functionality with third-party plugins
- 🎨 **Customizable UI**: Dark/light themes, responsive design
- 🛠️ **Tool-Using AI**: AI can call tools to fetch data and perform actions
- 📱 **Widgets**: Embed interactive components via iframes
- 🌐 **Self-Hosted**: Full control over your data and infrastructure

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (or Node.js 20+)
- Git

### Option 1: Local Development (with NBA Plugin)

```bash
# Clone the repository
git clone https://github.com/your-org/persai.git
cd persai

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start NBA plugin (in separate terminal)
cd examples/nba-plugin
bun run dev
# Plugin runs on http://localhost:3001

# Start PersAI (in another terminal)
cd ../..
bun run dev
# App runs on http://localhost:5173
```

Visit `http://localhost:5173` and ask: "What NBA games are today?"

### Option 2: Docker Compose (All-in-One)

```bash
# Clone the repository
git clone https://github.com/your-org/persai.git
cd persai

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run everything with Docker Compose
docker-compose up

# PersAI: http://localhost:5173
# NBA Plugin: http://localhost:3001
```

The NBA plugin is included and enabled by default!

## Plugin System

PersAI features an HTTP-based plugin architecture - plugins are **standalone services** that extend the AI's capabilities.

### How Plugins Work

Plugins are HTTP services that expose:
- `GET /manifest.json` - Plugin metadata and capabilities
- `POST /api/tools/{toolName}` - AI tool execution
- `GET /widgets/{widgetId}` - UI widgets (HTML/iframe)

### Quick Example

See the [NBA plugin example](./examples/nba-plugin/) - a complete, working plugin you can run and reference.

```bash
# Run the example
cd examples/nba-plugin
bun run dev

# Register it
# Edit plugins/registry.json:
{
  "plugins": [
    {
      "id": "nba",
      "url": "http://localhost:3001",
      "enabled": true
    }
  ]
}
```

### Managing Plugins

Plugins are configured in `plugins/registry.json`:

```json
{
  "plugins": [
    {
      "id": "my-plugin",
      "url": "http://localhost:3001",
      "enabled": true,
      "apiKey": "optional-key"
    }
  ]
}
```

Set `enabled: false` to disable a plugin.

### Example Plugins

- **[NBA Games](./examples/nba-plugin/)** - View NBA schedules and live scores
- More examples coming soon!

### Creating Plugins

PersAI offers **two approaches** for creating plugins:

**1. Plugin Server (Recommended for Simple Plugins)**
- Bun + Svelte server hosting multiple plugins
- Install plugins as npm packages - minimal boilerplate
- Pre-configured Tailwind + DaisyUI
- Perfect for simple tools and widgets

```bash
cd examples/plugin-server
bun install
bun run dev
```

See **[Plugin Server Guide](./examples/plugin-server/README.md)** for details.

**2. Full Application (For Complex Plugins)**
- Complete standalone application
- Any language/framework (TypeScript, Python, Go, Rust, etc.)
- Full control over architecture and UI
- Perfect for complex features

See **[Plugin Development Guide](./PLUGIN_DEVELOPMENT.md)** for examples.

**Not sure which to choose?** See **[Plugin Approaches Guide](./examples/PLUGIN_APPROACHES.md)** for comparison.

**Resources**:
- **[NBA Plugin Example](./examples/nba-plugin/)** - Working reference (full application)
- **[Quick Start](./plugins/README.md)** - Get started in 5 minutes

## Configuration

### Environment Variables

```env
# LLM API Keys
DEEPSEEK_API_KEY=your-key
OPENROUTER_API_KEY=your-key
YANDEX_API_KEY=your-key

# Optional: Plugin API Keys
WEATHER_API_KEY=your-key
```

### Model Selection

Edit `src/routes/api/chat/+server.ts` to change the active model:

```typescript
const model = getModel().orXiaomi; // Change this line
```

Available models:
- `depseekTimeweb`
- `yandexGPT51Pro`
- `AliceAILLM`
- `orXiaomi`
- `orGeminiFlash2`
- And more...

## Architecture

```
persai/
├── src/
│   ├── lib/
│   │   └── plugins/          # Plugin system
│   └── routes/
│       ├── api/chat/         # Chat API endpoint
│       └── external/         # Widget routes
├── plugins/
│   ├── registry.json         # Plugin configuration
│   ├── nba/                  # NBA plugin
│   └── TEMPLATE/             # Plugin template
└── explore-agents/           # Agent experiments
```

## Development

### Project Scripts

```bash
bun run dev        # Start dev server
bun run build      # Build for production
bun run preview    # Preview production build
bun run check      # Type check
bun run lint       # Lint and format
```

### Tech Stack

- **Frontend**: SvelteKit 5, TailwindCSS, DaisyUI
- **AI**: Vercel AI SDK with multiple LLM providers
- **Runtime**: Bun (or Node.js)
- **Type Safety**: TypeScript

## Deployment

### Docker

```dockerfile
# Dockerfile
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["bun", "run", "build/index.js"]
```

```bash
docker build -t persai .
docker run -p 3000:3000 --env-file .env persai
```

### Docker Compose

```yaml
version: '3.8'
services:
  persai:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    volumes:
      - ./plugins:/app/plugins
```

## Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

### Plugin Contributions

To contribute a plugin:
1. Create your plugin following [PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md)
2. Publish to npm or GitHub
3. Submit a PR to add it to the community plugin list

## Security

PersAI is designed to be self-hosted. Always:
- Keep your API keys secure
- Review plugin code before installing
- Run plugins in isolated environments when possible
- Use HTTPS in production

## License

MIT License - see [LICENSE](./LICENSE)

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/persai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/persai/discussions)
- **Documentation**: [Full Docs](https://persai.dev/docs)

## Roadmap

- [ ] Plugin marketplace
- [ ] Plugin CLI tool
- [ ] More built-in plugins
- [ ] Voice interface
- [ ] Mobile app
- [ ] Multi-user support

## Acknowledgments

Built with:
- [SvelteKit](https://kit.svelte.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [TailwindCSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)

---

**Made with ❤️ by the PersAI community**
