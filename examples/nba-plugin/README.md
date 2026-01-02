# NBA Plugin for PersAI

View NBA game schedules, scores, and live updates in your PersAI conversations.

## Features

- 🏀 **Live Scores** - Real-time NBA game scores from ESPN
- 📅 **Schedule** - View games for any date
- 📊 **Team Stats** - Team records and standings
- 🎨 **Beautiful Widgets** - Clean, responsive game display

## Installation

### Option 1: Run Locally

```bash
# Navigate to plugin directory
cd examples/nba-plugin

# Run with Bun
bun run dev
```

The plugin will be available at `http://localhost:3001`

### Option 2: Docker

```bash
# Build
docker build -t nba-plugin .

# Run
docker run -p 3001:3001 nba-plugin
```

### Option 3: Docker Compose (Recommended)

Add to your `docker-compose.yml`:

```yaml
services:
  persai:
    image: persai/core:latest
    ports:
      - "3000:3000"
    volumes:
      - ./plugins/registry.json:/app/plugins/registry.json

  nba-plugin:
    build: ./examples/nba-plugin
    ports:
      - "3001:3001"
```

Then:
```bash
docker-compose up
```

## Configuration

Edit `plugins/registry.json` in your PersAI installation:

```json
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

For Docker Compose, use the service name:
```json
{
  "plugins": [
    {
      "id": "nba",
      "url": "http://nba-plugin:3001",
      "enabled": true
    }
  ]
}
```

## Usage

Once configured, you can ask your AI:

- "What NBA games are today?"
- "How did the Lakers play?"
- "Show me today's NBA scores"
- "What games are on December 25th?"

## API Endpoints

### GET /manifest.json

Returns plugin metadata and capabilities.

```bash
curl http://localhost:3001/manifest.json
```

### POST /api/tools/getGames

Get NBA games for a specific date.

```bash
curl -X POST http://localhost:3001/api/tools/getGames \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-12-25"}'
```

Parameters:
- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.

Returns:
```json
{
  "games": [
    {
      "id": "401234567",
      "name": "Lakers vs Warriors",
      "home": "Los Angeles Lakers (102)",
      "away": "Golden State Warriors (98)",
      "status": "Final",
      "detail": "Final"
    }
  ]
}
```

### POST /api/tools/showGames

Returns a link to the games widget.

```bash
curl -X POST http://localhost:3001/api/tools/showGames \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-12-25"}'
```

Returns:
```json
{
  "link": "/widgets/games?date=2024-12-25"
}
```

### GET /widgets/games

Displays an HTML widget with NBA games.

```bash
open http://localhost:3001/widgets/games
```

Query parameters:
- `date` (optional): Date in YYYY-MM-DD format

## Development

### Project Structure

```
nba-plugin/
├── server.ts          # Main HTTP server
├── nba-api.ts         # ESPN API client
├── package.json       # Dependencies
├── Dockerfile         # Docker build
└── README.md          # This file
```

### Testing

```bash
# Start server
bun run dev

# Test manifest
curl http://localhost:3001/manifest.json

# Test tool
curl -X POST http://localhost:3001/api/tools/getGames \
  -H "Content-Type: application/json" \
  -d '{}'

# Test widget
open http://localhost:3001/widgets/games
```

## Data Source

Game data is fetched from the **ESPN Scoreboard API**:
- Free, public API
- Real-time scores and stats
- No API key required

API endpoint: `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`

## Customization

### Change Port

Set the `PORT` environment variable:

```bash
PORT=8080 bun run dev
```

Or in Docker:
```yaml
nba-plugin:
  build: ./examples/nba-plugin
  ports:
    - "8080:8080"
  environment:
    - PORT=8080
```

### Modify Widget Styling

Edit the CSS in `server.ts` (around line 130) to customize the widget appearance.

### Add More Tools

Add new tool definitions in the manifest and implement handlers:

```typescript
// In manifest
{
  name: 'getTeamStats',
  description: 'Get statistics for a specific team',
  endpoint: '/api/tools/getTeamStats',
  parameters: {
    type: 'object',
    properties: {
      teamName: { type: 'string' }
    }
  }
}

// Add handler
if (url.pathname === '/api/tools/getTeamStats') {
  const params = await req.json();
  // Implement team stats logic
  return Response.json({ stats: ... });
}
```

## Troubleshooting

### Plugin not loading

1. Check the server is running:
   ```bash
   curl http://localhost:3001/health
   ```

2. Check PersAI logs for errors

3. Verify `plugins/registry.json` is correct

### No games showing

- ESPN API may be down (rare)
- Check server logs for API errors
- Try a different date

### CORS errors in widget

The server includes CORS headers by default. If you still see errors, check your browser console.

## License

MIT

## Contributing

This is an example plugin for PersAI. Feel free to fork and modify for your own needs!

## Related

- **PersAI**: https://github.com/your-org/persai
- **Plugin Development Guide**: See `PLUGIN_DEVELOPMENT.md` in main repo
- **ESPN API**: https://www.espn.com/apis/devcenter/docs/

## Support

For issues with this plugin:
- Check the troubleshooting section above
- Open an issue in the main PersAI repo
- Review the plugin development docs
