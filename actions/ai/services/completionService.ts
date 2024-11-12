import { createOllamaCompletion } from './ollamaService';
import { getFullModelName } from '@/lib/modelUtils';
import { FormattedMessage } from '@/types/messages';
import { retryWithBackoff } from '@/lib/retryUtils';

export async function createCompletion(
  messages: FormattedMessage[],
  model: string,
  onToken: (token: string) => void
) {
  const fullModelName = getFullModelName(model);
  
  // Check if we need to use a vision model
  const hasImages = messages.some(msg => 
    Array.isArray(msg.content) && 
    msg.content.some(c => c.type === 'image_url')
  );
  
  if (hasImages && !fullModelName.includes('vision')) {
    console.log('Switching to vision model for image processing');
    // model = fullModelName; // or your preferred vision model
  }

  try {
    const fullResponse = await retryWithBackoff(
      () => createOllamaCompletion(messages, fullModelName, onToken),
      {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 5000
      }
    );

    return fullResponse;
  } catch (error) {
    console.error('Completion error:', error);
    if (error instanceof Error) {
      throw new Error(`Ollama API error: ${error.message}`);
    }
    throw error;
  }
}
