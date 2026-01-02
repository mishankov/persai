import { type UIMessage, convertToModelMessages, stepCountIs, ToolLoopAgent } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

import { OPENROUTER_API_KEY } from '$env/static/private';

import { loadTools } from '$lib/tools/index.js';

const getModel = () => {
	return {
		orXiaomi: createOpenAICompatible({
			name: '',
			baseURL: 'http://localhost:14443/openrouter',
			apiKey: OPENROUTER_API_KEY
		})('xiaomi/mimo-v2-flash:free'),
		orAllen: createOpenAICompatible({
			name: '',
			baseURL: 'http://localhost:14443/openrouter',
			apiKey: OPENROUTER_API_KEY
		})('allenai/olmo-3.1-32b-think:free'),
		orGeminiFlash2: createOpenAICompatible({
			name: '',
			baseURL: 'http://localhost:14443/openrouter',
			apiKey: OPENROUTER_API_KEY
		})('google/gemini-2.0-flash-exp:free')
	}.orXiaomi;
};

const tools = await loadTools();

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
