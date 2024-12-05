import OpenAI from 'openai';
import { AI_CONSTANTS } from './constants';

export const openai = new OpenAI({
  baseURL: process.env.NEXT_PUBLIC_OPENAI_URL,
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  maxRetries: AI_CONSTANTS.MAX_RETRIES,
  timeout: 30000
});

export const defaultCompletionConfig = {
  temperature: AI_CONSTANTS.DEFAULT_TEMPERATURE,
  max_tokens: AI_CONSTANTS.MAX_TOKENS
}; 