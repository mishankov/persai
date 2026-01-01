import { type UIMessage, convertToModelMessages, stepCountIs, tool, ToolLoopAgent } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { getScoreboard } from './api';

import { DEEPSEEK_API_KEY, OPENROUTER_API_KEY, YANDEX_API_KEY } from '$env/static/private';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { createOllama, ollama } from 'ollama-ai-provider-v2';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const getModel = () => {
	return {
		depseekTimeweb: createOpenAI({
			apiKey: DEEPSEEK_API_KEY ?? '',
			baseURL: 'http://localhost:14443/deepseek-timeweb'
		}).chat('deepseek-chat'),
		yandexGPT51Pro: createOpenAI({
			apiKey: YANDEX_API_KEY,
			baseURL: 'http://localhost:14443/ya-gpt-opencode'
		})('gpt://b1geld53jbdivlt8oaer/yandexgpt/rc'),
		AliceAILLM: createOpenAI({
			apiKey: YANDEX_API_KEY,
			baseURL: 'http://localhost:14443/ya-gpt-opencode'
		})('gpt://b1geld53jbdivlt8oaer/aliceai-llm/latest'),
		yandexgptoss120: createOpenAI({
			apiKey: YANDEX_API_KEY,
			baseURL: 'http://localhost:14443/ya-gpt-opencode'
		})('gpt://b1geld53jbdivlt8oaer/gpt-oss-120b/latest'),
		ollamagptoss20: createOllama({
			baseURL: 'http://localhost:14443/ollama/api'
		})('gpt-oss:20b'),
		orXiaomi: createOpenAICompatible({
			name: '',
			baseURL: 'http://localhost:14443/openrouter',
			apiKey: OPENROUTER_API_KEY
		})('xiaomi/mimo-v2-flash:free'),
		orAllen: createOpenRouter({
			apiKey: OPENROUTER_API_KEY
		})('allenai/olmo-3.1-32b-think:free'),
		orGeminiFlash2: createOpenRouter({
			apiKey: OPENROUTER_API_KEY
		})('google/gemini-2.0-flash-exp:free')
	}.orXiaomi;
};

const tools = {
	// general tools
	webfetch: tool({
		description: 'fetches data from web by link',
		inputSchema: z.object({
			link: z.string()
		}),
		execute: async ({ link }) => {
			console.log('webfetch called with', link);
			const response = await fetch(link);
			const text = await response.text();
			return text;
		}
	}),
	getGames: tool({
		description: 'Получить расписание и результаты сегодняшних матчей НБА',
		inputSchema: z.object().describe('Пустой объект'),
		execute: async () => {
			console.log('getGames called');
			const scoreboard = await getScoreboard();

			return scoreboard.events;
		}
	}),
	showGames: tool({
		description:
			'Показывает пользователю список сегодняшних игр НБА с их результатами, если игры уже прошли. Всегдя используй этот тул, если пользователь спрашивает о всех сегодняшних играх. Не подходит для отображения информации об одной игре',
		inputSchema: z.object().describe('Пустой объект'),
		execute: async () => {
			console.log('showGames called');

			return { link: '/external/nba/games' };
		}
	}),
	showGame: tool({
		description:
			'Показывает пользователю результаты конкретной игры НБА. Всегдя используй этот тул, если пользователь спрашивает о конкретной игре',
		inputSchema: z.object({
			gameId: z.string()
		}),
		execute: async ({ gameId }) => {
			console.log('showGame called for', gameId);

			return { link: 'http://link.to/showGame/' + gameId };
		}
	})
};

const sheduleAgent = new ToolLoopAgent({
	model: getModel(),
	instructions: `
    Ты персональный помошник. Твоя обязанность - отвечасть на вопросы пользователя используя и доступные тебе инструменты

    Вызавай tool без анонсирования этого пользователю
    `,
	tools: tools,
	stopWhen: [
		stepCountIs(20),
		({ steps }) => {
			const lastContent = steps.at(-1)?.content.at(-1);
			if (
				lastContent &&
				lastContent.type === 'tool-result' &&
				lastContent.toolName.startsWith('show')
			) {
				console.info('stoping after calling', lastContent.toolName);
				return true;
			}

			return false;
		}
	]
});

export async function POST({ request }) {
	const { messages }: { messages: UIMessage[] } = await request.json();

	const result = await sheduleAgent.stream({
		messages: await convertToModelMessages(messages)
	});

	return result.toUIMessageStreamResponse();
}
