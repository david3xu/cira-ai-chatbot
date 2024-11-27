import OpenAI from 'openai';
import { AI_CONSTANTS } from './constants';

export const openai = new OpenAI({
  baseURL: process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL ? `${process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL}/v1` : 'http://localhost:11434/v1',
  apiKey: 'ollama',
  maxRetries: AI_CONSTANTS.MAX_RETRIES,
  timeout: 30000
});

export const defaultCompletionConfig = {
  temperature: AI_CONSTANTS.DEFAULT_TEMPERATURE,
  max_tokens: AI_CONSTANTS.MAX_TOKENS,
  model: AI_CONSTANTS.DEFAULT_MODEL
}; 