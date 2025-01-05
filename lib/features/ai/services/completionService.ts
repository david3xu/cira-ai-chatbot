import OpenAI from 'openai';
import { retryWithBackoff } from '../utils/retry';
import { openai } from '../config/openai';
import { FormattedMessage } from '@/lib/types';
/**
 * Completion Service
 * 
 * Handles AI completions with:
 * - Streaming support
 * - Error handling
 * - Retry logic
 * - Token management
 * 
 * Features:
 * - Stream processing
 * - Error recovery
 * - Temperature control
 * - Token limiting
 * - Response formatting
 */
export async function createCompletion(
  messages: FormattedMessage[],
  model: string,
  onToken?: (token: string) => void
): Promise<string> {
  console.log('🔍 [createCompletion] Starting with model:', {
    model,
    messageCount: messages.length,
    streaming: !!onToken
  });

  return retryWithBackoff(async () => {
    try {
      if (onToken) {
        console.log('🔍 [createCompletion] Creating streaming completion:', { model });
        const stream = await openai.chat.completions.create({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: true
        });

        let fullResponse = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            onToken(content);
          }
        }
        return fullResponse;
      } else {
        console.log('🔍 [createCompletion] Creating non-streaming completion:', { model });
        const response = await openai.chat.completions.create({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        });
        return response.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('🔍 [createCompletion] Error:', {
        model,
        error: error instanceof Error ? error.message : error
      });
      if (error instanceof OpenAI.APIError) {
        throw new Error(`API error: ${error.message}`);
      }
      throw error;
    }
  });
} 