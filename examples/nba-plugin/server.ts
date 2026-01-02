import { getScoreboard, formatGameData } from './nba-api';

const PORT = process.env.PORT || 3001;

/**
 * NBA Plugin HTTP Server
 *
 * Implements the PersAI plugin interface:
 * - GET  /manifest.json - Plugin metadata
 * - POST /api/tools/* - Tool execution
 * - GET  /widgets/* - Widget HTML
 */
Bun.serve({
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url);
		console.log(`${req.method} ${url.pathname}`);

		// Enable CORS for iframe widgets
		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization'
		};

		if (req.method === 'OPTIONS') {
			return new Response(null, { headers });
		}

		try {
			// Plugin Manifest
			if (url.pathname === '/manifest.json') {
				return Response.json(
					{
						id: 'nba',
						name: 'NBA Games',
						version: '1.0.0',
						description: 'View NBA game schedules, scores, and live updates',
						author: 'PersAI Team',
						tools: [
							{
								name: 'getGames',
								description: 'Получить расписание и результаты матчей НБА за указанную дату',
								endpoint: '/api/tools/getGames',
								parameters: {
									type: 'object',
									properties: {
										date: {
											type: 'string',
											description: 'Date in YYYY-MM-DD format (optional, defaults to today)'
										}
									}
								}
							},
							{
								name: 'showGames',
								description:
									'Показывает пользователю список игр НБА с их результатами. Всегда используй этот тул, если пользователь спрашивает о всех играх за день',
								endpoint: '/api/tools/showGames',
								parameters: {
									type: 'object',
									properties: {
										date: {
											type: 'string',
											description: 'Date in YYYY-MM-DD format (optional)'
										}
									}
								}
							}
						],
						widgets: [
							{
								id: 'games-list',
								title: 'NBA Games',
								url: '/widgets/games',
								description: 'Display list of NBA games with scores'
							}
						]
					},
					{ headers }
				);
			}

			// Tool: getGames
			if (url.pathname === '/api/tools/getGames') {
				const params = await req.json();
				const data = await getScoreboard(params.date);

				const games = data.events.map((game) => {
					const formatted = formatGameData(game);
					return {
						id: formatted.id,
						name: formatted.name,
						home: `${formatted.home.name} (${formatted.home.score})`,
						away: `${formatted.away.name} (${formatted.away.score})`,
						status: formatted.status,
						detail: formatted.statusDetail
					};
				});

				return Response.json({ games }, { headers });
			}

			// Tool: showGames
			if (url.pathname === '/api/tools/showGames') {
				const params = await req.json();
				const dateParam = params.date ? `?date=${params.date}` : '';

				return Response.json(
					{
						link: `/widgets/games${dateParam}`
					},
					{ headers }
				);
			}

			// Widget: NBA Games
			if (url.pathname === '/widgets/games') {
				const date = url.searchParams.get('date') || undefined;
				const data = await getScoreboard(date);
				const games = data.events.map(formatGameData);

				const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NBA Games</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      padding: 20px;
      background: #f5f5f5;
      color: #333;
    }

    h1 {
      margin-bottom: 20px;
      color: #1d4ed8;
    }

    .games-grid {
      display: grid;
      gap: 15px;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .game-card {
      background: white;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .game-status {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-badge {
      background: #3b82f6;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }

    .team {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .team:last-of-type {
      border-bottom: none;
    }

    .team-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .team-logo {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .team-name {
      font-weight: 500;
    }

    .team-record {
      font-size: 11px;
      color: #6b7280;
    }

    .team-score {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }

    .game-detail {
      margin-top: 10px;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }

    .no-games {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <h1>🏀 NBA Games${date ? ` - ${date}` : ''}</h1>

  ${
		games.length === 0
			? '<div class="no-games">No games scheduled</div>'
			: `
    <div class="games-grid">
      ${games
				.map(
					(game) => `
        <div class="game-card">
          <div class="game-status">
            <span>${game.status}</span>
            ${game.clock && game.period ? `<span class="status-badge">Q${game.period} ${game.clock}</span>` : ''}
          </div>

          <div class="team">
            <div class="team-info">
              <img src="${game.away.logo}" alt="${game.away.name}" class="team-logo">
              <div>
                <div class="team-name">${game.away.name}</div>
                ${game.away.records ? `<div class="team-record">${game.away.records.find((r) => r.type === 'total')?.summary || ''}</div>` : ''}
              </div>
            </div>
            <div class="team-score">${game.away.score}</div>
          </div>

          <div class="team">
            <div class="team-info">
              <img src="${game.home.logo}" alt="${game.home.name}" class="team-logo">
              <div>
                <div class="team-name">${game.home.name}</div>
                ${game.home.records ? `<div class="team-record">${game.home.records.find((r) => r.type === 'total')?.summary || ''}</div>` : ''}
              </div>
            </div>
            <div class="team-score">${game.home.score}</div>
          </div>

          <div class="game-detail">${game.statusDetail}</div>
        </div>
      `
				)
				.join('')}
    </div>
  `
	}
</body>
</html>
        `;

				return new Response(html, {
					headers: {
						...headers,
						'Content-Type': 'text/html; charset=utf-8'
					}
				});
			}

			// Health check
			if (url.pathname === '/health') {
				return Response.json({ status: 'healthy' }, { headers });
			}

			// 404
			return new Response('Not found', { status: 404, headers });
		} catch (error) {
			console.error('Error:', error);
			return Response.json(
				{
					error: error instanceof Error ? error.message : 'Internal server error'
				},
				{ status: 500, headers }
			);
		}
	}
});

console.log(`🏀 NBA Plugin running on http://localhost:${PORT}`);
console.log(`📋 Manifest: http://localhost:${PORT}/manifest.json`);
console.log(`🎮 Widget: http://localhost:${PORT}/widgets/games`);
