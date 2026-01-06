import { stepCountIs, ToolLoopAgent, type ModelMessage } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

import { OPENROUTER_API_KEY } from '$env/static/private';

import { loadTools } from '$lib/tools';
import { db } from '$lib/server/db';
import { messagesTable, providersTable } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

const tools = await loadTools();

export async function POST({ request }) {
	const req: {
		model: {
			providerId: number;
			modelId: string;
		};
		chatId: number;
		message: string;
	} = await request.json();

	const provider = (
		await db.select().from(providersTable).where(eq(providersTable.id, req.model.providerId))
	)[0];

	const messages = await db
		.select()
		.from(messagesTable)
		.where(eq(messagesTable.chatId, req.chatId));

	const modelMessages = messages.map((message) => message.content);

	const userMessage: ModelMessage = {
		role: 'user',
		content: req.message
	};
	await db.insert(messagesTable).values({
		chatId: req.chatId,
		createdAt: new Date().toISOString(),
		content: userMessage
	});

	modelMessages.push(userMessage);

	const sheduleAgent = new ToolLoopAgent({
		model: createOpenAICompatible({
			name: provider.name,
			baseURL: provider.baseUrl,
			apiKey: provider.apiKey
		})(req.model.modelId),
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
		onFinish: (event) => {
			event.response.messages.forEach(async (message) => {
				await db.insert(messagesTable).values({
					chatId: 0,
					createdAt: new Date().toISOString(),
					content: message
				});
			});
		}
	});

	const result = await sheduleAgent.stream({
		messages: modelMessages
	});

	return result.toUIMessageStreamResponse();
}
