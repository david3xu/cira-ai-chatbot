/**
 * OpenAI Configuration
 * 
 * Sets up OpenAI client with:
 * - API configuration
 * - Default parameters
 * - Timeout settings
 * - Retry policies
 * 
 * Features:
 * - Environment-based configuration
 * - Default completion settings
 * - Error handling
 * - Timeout management
 */

import OpenAI from 'openai';
import { AI_CONSTANTS } from './constants';

export const openai = new OpenAI({
  baseURL: process.env.NEXT_PUBLIC_OPENAI_URL,
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  maxRetries: AI_CONSTANTS.MAX_RETRIES,
  timeout: 30000,
  dangerouslyAllowBrowser: true
});

export const defaultCompletionConfig = {
  temperature: AI_CONSTANTS.DEFAULT_TEMPERATURE,
  max_tokens: AI_CONSTANTS.MAX_TOKENS
}; 