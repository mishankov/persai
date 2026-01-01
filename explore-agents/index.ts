import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { tool, stepCountIs, streamText } from 'ai';
import { z } from 'zod';

// const model = createOpenRouter({
// 	apiKey: process.env.OPENROUTER_API_KEY
// })('xiaomi/mimo-v2-flash:free');

const model = createOpenAICompatible({
	name: '',
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: process.env.OPENROUTER_API_KEY
})('xiaomi/mimo-v2-flash:free');

const result = streamText({
	model: model,
	tools: {
		weather: tool({
			description: 'Get the weather in a location',
			inputSchema: z.object({
				location: z.string().describe('The location to get the weather for')
			}),
			execute: async ({ location }) => ({
				location,
				temperature: 72 + Math.floor(Math.random() * 21) - 10
			})
		})
	},
	// stopWhen: stepCountIs(5),
	messages: [
		{
			role: 'user',
			content: 'What is the weather in Moscow?'
		}
	]
});

for await (const textPart of result.textStream) {
	console.log(textPart);
}

const steps = await result.steps;
for (const step of steps) {
	console.log('=== step ===');
	for (const content of step.content) {
		console.log('=== content part ===');
		if (content.type === 'text') {
			console.log(content.text);
		} else if (content.type === 'tool-result') {
			console.log('tool-result');
			console.log('input:', content.input);
			console.log('output:', content.output);
		} else {
			console.log(content);
		}
	}
}
