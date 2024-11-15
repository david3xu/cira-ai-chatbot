import OpenAI from 'openai';
import { DEFAULT_MODEL } from '@/lib/modelUtils';
import { performHybridSearch } from '@/actions/ai/utils/embedding';
import { structureResponse } from '@/actions/ai/utils/responseFormatter';
import { processMessages } from '@/actions/ai/services/messageProcessor';
import { createCompletion } from '@/actions/ai/services/completionService';
import { getContextualPrompt } from '@/actions/ai/prompts/systemMessages';
import { storeChatMessage } from '@/actions/chat/storeMessage';
import { ChatCompletionContentPart } from 'openai/resources/chat/completions.mjs';

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

interface FormattedMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ChatCompletionContentPart[];
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

    let previousConvo = chatHistory.map(msg => 
      `${msg.role.toUpperCase()}: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`
    ).join('\n');

    let contextText = '';
    if (dominationField !== 'Normal Chat' && dominationField !== 'Email') {
      try {
        const pageSections = await performHybridSearch(sanitizedQuery, dominationField);
        if (pageSections) {
          for (const section of pageSections) {
            contextText += `${section.content.trim()}\n---\n`;
          }
        }

        console.log('Context text:', contextText);

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
    let fullResponse = await createCompletion(
      apiMessages, 
      model || DEFAULT_MODEL, 
      onToken
    );

    if (!fullResponse || typeof fullResponse.content !== 'string' || !fullResponse.content.trim()) {
      // Retry once with a simplified prompt
      console.log('Empty response received, retrying with simplified prompt...');
      const simplifiedPrompt = `Please answer this question clearly and directly: ${sanitizedQuery}`;
      
      const retryResponse = await createCompletion(
        [{ role: 'user', content: simplifiedPrompt }],
        model || DEFAULT_MODEL,
        onToken
      );

      if (!retryResponse || typeof retryResponse.content !== 'string' || !retryResponse.content.trim()) {
        throw new Error('Unable to generate a valid response after retry');
      }

      fullResponse = retryResponse;
    }

    const structuredResponse = structureResponse(fullResponse.content);

    console.log('Structured response:', structuredResponse);

    if (!skipMessageStorage) {
      const messageResult = await storeChatMessage(
        chatId, 
        'assistant', 
        structuredResponse, 
        dominationField, 
        undefined,
        chatHistory.length === 0 ? structuredResponse.split('.')[0] + '.' : undefined
      );

      if (!messageResult) {
        throw new Error('Failed to store assistant message');
      }
    }

    return {
      content: structuredResponse,
      chat_topic: chatHistory.length === 0 ? structuredResponse.split('.')[0] + '.' : undefined
    };
  } catch (error) {
    console.error('Error in answerQuestion:', error);
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.message}`);
    } else if (error instanceof Error) {
      if (error.message.includes('Connection error')) {
        throw new Error('Unable to connect to the AI server. Please check your connection and try again.');
      } else if (error.message.includes('Invalid response format')) {
        throw new Error('Received invalid response from AI service. Please try again.');
      } else if (error.message.includes('Unable to generate')) {
        throw new Error('Unable to generate a meaningful response. Please rephrase your question and try again.');
      }
    }
    throw new Error('An error occurred while processing your question. Please try again later.');
  }
}
