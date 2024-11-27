import OpenAI from 'openai';
import { retryWithBackoff } from '../utils/retry';
import { FormattedMessage } from '@/lib/types/chat/formattedMessage';
import { openai } from '../config/openai';

export async function createCompletion(
  messages: FormattedMessage[],
  model: string,
  onToken?: (token: string) => void
): Promise<string> {
  return retryWithBackoff(async () => {
    try {
      if (onToken) {
        const stream = await openai.chat.completions.create({
          model,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 2000,
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
        const response = await openai.chat.completions.create({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        });
        return response.choices[0]?.message?.content || '';
      }
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`API error: ${error.message}`);
      }
      throw error;
    }
  });
} 