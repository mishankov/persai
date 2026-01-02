# IMPORTANT: Widget Architecture for PersAI Plugins

## The SvelteKit Constraint

**Svelte components (.svelte files) MUST be in the `src/routes/` directory to work.**

This is a fundamental SvelteKit limitation - Svelte files outside of `src/routes/` will not be compiled or served.

## Correct Plugin Structure

### For Local Plugins (In-Process)

```
Your project structure:

src/routes/external/my-plugin/    ← Svelte widgets go here
└── widget/
    └── +page.svelte

plugins/my-plugin/                ← Plugin logic goes here
├── package.json
├── index.ts
├── tools.ts
└── api.ts
```

**Plugin Definition:**
```typescript
// plugins/my-plugin/index.ts
const myPlugin: Plugin = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',

  tools: [...],  // ✅ Lives in plugins/

  widgets: [
    {
      id: 'my-widget',
      title: 'My Widget',
      path: '/external/my-plugin/widget'  // ← Route path, not file path!
    }
  ]
};
```

**Widget File:**
```svelte
<!-- src/routes/external/my-plugin/widget/+page.svelte -->
<script>
  // Your widget code
</script>

<div>Widget content</div>
```

## What This Means

### ✅ Tools & Logic: Fully Decoupled
- Tool functions live in `plugins/my-plugin/`
- API clients live in `plugins/my-plugin/`
- Business logic lives in `plugins/my-plugin/`
- Can be disabled via configuration
- True plugin architecture

### ⚠️ Widgets: Partial Decoupling
- Widget Svelte files must be in `src/routes/external/[plugin-id]/`
- Plugin just references the route path
- Widget can import from plugin directory for logic
- Still logically belongs to the plugin

### Why This Works

Even though widget files are in `src/routes/`, they're still effectively part of the plugin:

1. **Logical Organization**: Widgets are in `/external/[plugin-id]/` namespace
2. **Import Plugin Code**: Widgets can import from the plugin directory
3. **Configuration**: Plugin metadata defines which widgets exist
4. **Removal**: Delete both `plugins/my-plugin/` and `src/routes/external/my-plugin/` to remove

## Example: NBA Plugin

**Tools** (✅ fully in plugin dir):
```
plugins/nba/
├── index.ts      # Plugin definition
├── tools.ts      # getGames, showGames tools
└── api.ts        # ESPN API client
```

**Widget** (⚠️ must be in src/routes):
```
src/routes/external/nba/games/
└── +page.svelte  # NBA games display widget
```

**Plugin Definition:**
```typescript
// plugins/nba/index.ts
import { nbaTools } from './tools';

const nbaPlugin: Plugin = {
  id: 'nba',
  tools: nbaTools,  // ✅ from plugins/nba/tools.ts

  widgets: [
    {
      id: 'games-list',
      path: '/external/nba/games'  // ← route in src/routes/external/nba/games/
    }
  ]
};
```

## For True Full Decoupling: External Service Plugins

If you want widgets completely outside of the core project, use an external service:

```
my-plugin-service/          # Separate HTTP service
├── server.js               # Express/Flask/any framework
├── manifest.json           # Plugin manifest
└── public/
    └── widget.html         # Your widget
```

**Serve it:**
```bash
# Any language, any framework
docker run -p 3001:3001 my-plugin-service
```

**Register it:**
```json
{
  "id": "my-plugin",
  "type": "external",
  "url": "http://localhost:3001",
  "enabled": true
}
```

**Widget URL in manifest:**
```json
{
  "widgets": [
    {
      "id": "my-widget",
      "url": "/widget.html"  // ← Full URL: http://localhost:3001/widget.html
    }
  ]
}
```

## Summary Table

| Plugin Type | Tools Location | Widgets Location | True Decoupling |
|-------------|---------------|------------------|-----------------|
| **Local** | `plugins/my-plugin/` | `src/routes/external/my-plugin/` | Tools: ✅ / Widgets: ⚠️ |
| **External** | External HTTP service | External HTTP service | ✅ Fully |
| **Remote** | Remote HTTP service | Remote HTTP service | ✅ Fully |

## Migration Guide

If you created a plugin with widgets in the `plugins/` directory:

1. **Move widget files:**
   ```bash
   mv plugins/my-plugin/routes/widget src/routes/external/my-plugin/
   ```

2. **Update plugin definition:**
   ```typescript
   widgets: [
     {
       path: '/external/my-plugin/widget'  // Change from './routes/widget/+page.svelte'
     }
   ]
   ```

3. **Update widget imports:**
   ```svelte
   <!-- src/routes/external/my-plugin/widget/+page.svelte -->
   <script>
     // Import from plugin directory (still works!)
     import { myApi } from '../../../../plugins/my-plugin/api';
   </script>
   ```

## Best Practices

### For Plugin Developers:

1. **Keep logic in plugins/**: All business logic, API clients, tool functions
2. **Keep UI in src/routes/external/**: Only Svelte components
3. **Import from plugins/**: Widgets can import logic from the plugin directory
4. **Document clearly**: Tell users they need to create the widget directory

### For Plugin Users:

When installing a local plugin with widgets:

1. **Install plugin code:**
   ```bash
   cd plugins
   git clone https://github.com/dev/plugin my-plugin
   ```

2. **Install widget files** (if included):
   ```bash
   # If plugin provides a widget directory
   cp -r plugins/my-plugin/widget-files src/routes/external/my-plugin
   ```

3. **Or follow plugin docs**: Plugin may have specific installation instructions

## Why This Limitation Exists

SvelteKit's compiler:
- Only processes files in `src/routes/` for routing
- Only compiles `.svelte` files it discovers during build
- Uses file-based routing convention
- Cannot dynamically compile files from arbitrary locations

This is not a bug - it's how SvelteKit is designed to work.

## Future Possibilities

Possible future enhancements:
- Build-time plugin compilation
- Vite plugin to discover widget files
- Hot-reload widget registration
- Symlink automation

For now, the `src/routes/external/[plugin-id]/` convention provides the best balance of:
- SvelteKit compatibility ✅
- Logical organization ✅
- Clear ownership ✅
- Import capability ✅
