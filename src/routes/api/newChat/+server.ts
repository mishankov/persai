import { stepCountIs, ToolLoopAgent } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

import { OPENROUTER_API_KEY } from '$env/static/private';

import { loadTools } from '$lib/tools';
import { db } from '$lib/server/db';
import { messagesTable } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

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
	],
	onFinish: () => {}
});

export async function POST({ request }) {
	const req: {
		model: {
			providerId: string;
			modelId: string;
		};
		chatId: number;
		message: string;
	} = await request.json();

	console.log('New message data:', req);

	const messages = await db
		.select()
		.from(messagesTable)
		.where(eq(messagesTable.chatId, req.chatId));

	const modelMessages = messages.map((message) => message.content);

	modelMessages.push({
		role: 'user',
		content: req.message
	});

	const result = await sheduleAgent.stream({
		messages: modelMessages
	});

	return new Response(result.fullStream);
}
