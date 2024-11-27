import { DEFAULT_MODEL } from '@/lib/features/ai/utils/modelUtils';
import { performHybridSearch } from '@/lib/features/ai/utils/embedding';
import { structureResponse } from '@/lib/features/ai/utils/responseFormatter';
import { processMessages } from '../services/messageProcessor';
import { createCompletion } from '../services/completionService';
import { getContextualPrompt } from '../prompts/systemMessages';
import { FormattedMessage } from '@/lib/types/chat/formattedMessage';

interface AnswerQuestionResponse {
  content: string;
  chat_topic?: string;
}

interface AnswerQuestionParams {
  message: string;
  chatHistory: any[];
  dominationField?: string;
  chatId: string;
  customPrompt?: string;
  imageBase64?: string;
  model?: string;
  onToken?: (token: string) => void;
  onError?: (error: string) => void;
  skipMessageStorage?: boolean;
}

export async function answerQuestion({
  message,
  chatHistory,
  dominationField = 'Normal Chat',
  chatId,
  customPrompt,
  imageBase64,
  model,
  onToken = () => {},
  onError = () => {},
  skipMessageStorage = false
}: AnswerQuestionParams): Promise<AnswerQuestionResponse> {
  console.log('Starting answerQuestion with model:', model || DEFAULT_MODEL);

  try {
    if (!chatHistory) {
      throw new Error('No chat history provided');
    }

    const sanitizedQuery = message.trim().replace(/[\r\n]+/g, ' ').substring(0, 500);
    if (!sanitizedQuery) {
      throw new Error('No valid message content found');
    }

    let previousConvo = chatHistory.map(msg => {
      const role = msg.role?.toUpperCase() || 'USER';
      const content = typeof msg.content === 'string' 
        ? msg.content 
        : msg.content 
          ? JSON.stringify(msg.content) 
          : '';
      return `${role}: ${content}`;
    }).join('\n');

    let contextText = '';
    if (dominationField !== 'Normal Chat' && dominationField !== 'Email') {
      try {
        const pageSections = await performHybridSearch(sanitizedQuery, dominationField);
        if (pageSections) {
          for (const section of pageSections) {
            contextText += `${section.content?.trim() || ''}\n---\n`;
          }
        }

        const documentContent = chatHistory
          .filter(msg => msg.document?.text)
          .map(msg => msg.document.text)
          .join('\n\n');

        if (documentContent) {
          contextText = `Document Content:\n${documentContent}\n\n${contextText}`;
        }
      } catch (searchError) {
        console.warn('Search failed, falling back to default prompt:', searchError);
        contextText = 'Unable to retrieve specific context. Answering based on general knowledge.';
      }
    }

    const prompt = getContextualPrompt(
      dominationField,
      previousConvo,
      sanitizedQuery,
      contextText,
      customPrompt
    );

    console.log('Generated prompt:', prompt);

    const apiMessages = processMessages(chatHistory, prompt, dominationField, imageBase64) as FormattedMessage[];
    console.log('API Messages:', JSON.stringify(apiMessages, null, 2));
    
    let fullResponse = await createCompletion(
      apiMessages as any, 
      model || DEFAULT_MODEL, 
      onToken
    );

    console.log('Initial response:', fullResponse);

    if (!fullResponse || typeof fullResponse !== 'string' || !fullResponse.trim()) {
      console.log('Empty response received, retrying with simplified prompt...');
      const simplifiedPrompt = `Please answer this question clearly and directly: ${sanitizedQuery}`;
      
      console.log('Retry with simplified prompt:', simplifiedPrompt);
      
      const retryResponse = await createCompletion(
        [{ role: 'user', content: simplifiedPrompt }],
        model || DEFAULT_MODEL,
        onToken
      );

      console.log('Retry response:', retryResponse);

      if (!retryResponse || typeof retryResponse !== 'string' || !retryResponse.trim()) {
        throw new Error('Unable to generate a valid response after retry');
      }

      fullResponse = retryResponse;
    }

    const structuredResponse = structureResponse(fullResponse);
    
    return {
      content: structuredResponse,
      chat_topic: chatHistory.length === 0 ? sanitizedQuery : undefined
    };

  } catch (error) {
    console.error('Error in answerQuestion:', error);
    onError(error instanceof Error ? error.message : 'An unknown error occurred');
    throw error;
  }
} 