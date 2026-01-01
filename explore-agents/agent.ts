import { Tool, UserModelMessage, type ModelMessage } from 'ai';
import { type LanguageModelV3 } from '@ai-sdk/provider';

type Agent = {
	tools: Tool[];
};

const a = new Agent();
a.addMessage({ role: 'user', content: 'kek' });
