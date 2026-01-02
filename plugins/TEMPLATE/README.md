# Plugin Template

Use this template to create a new PersAI plugin.

## Quick Start

```bash
# Copy this template
cp -r plugins/TEMPLATE plugins/my-plugin

# Edit the plugin
cd plugins/my-plugin
# Edit index.ts with your plugin details
```

## Plugin Structure

```
plugins/my-plugin/
├── package.json          # Plugin metadata
├── index.ts              # Plugin definition (REQUIRED)
├── tools.ts              # Tool implementations (optional)
└── api.ts                # API clients (optional)
```

## Important: Widget Files

**For local plugins, Svelte widgets CANNOT be in the plugins/ directory!**

Due to SvelteKit's architecture, Svelte components must be in `src/routes/`.

### Where to put widget files:

1. **Create widget directory:**
   ```
   src/routes/external/my-plugin/
   └── widget/
       └── +page.svelte
   ```

2. **Reference in your plugin:**
   ```typescript
   widgets: [
     {
       id: 'my-widget',
       title: 'My Widget',
       path: '/external/my-plugin/widget'  // Route path
     }
   ]
   ```

## What Goes Where

| Component | Location | Why |
|-----------|----------|-----|
| **Tools** | `plugins/my-plugin/` | ✅ Can be anywhere |
| **API Clients** | `plugins/my-plugin/` | ✅ Can be anywhere |
| **Business Logic** | `plugins/my-plugin/` | ✅ Can be anywhere |
| **Svelte Widgets** | `src/routes/external/my-plugin/` | ⚠️ SvelteKit requirement |

## Alternative: External Service Plugin

If you want true decoupling including widgets, create an external HTTP service:

```
my-plugin-service/          # Your HTTP server (any language!)
├── server.py               # Flask/FastAPI/Express/etc
├── manifest.json           # Plugin manifest
├── /api/tools/             # Tool endpoints
└── /widget/                # Widget HTML pages
```

Then register as external:
```json
{
  "id": "my-plugin",
  "type": "external",
  "url": "http://localhost:3001",
  "enabled": true
}
```

## See Also

- Full docs: `../../PLUGIN_DEVELOPMENT.md`
- Working example: `../nba/` (NBA plugin)
