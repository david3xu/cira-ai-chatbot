/**
 * Answer Question Action
 * 
 * Handles AI response generation with:
 * - Context-aware responses
 * - Domain-specific processing
 * - Streaming support
 * - Message persistence
 * 
 * Features:
 * - Multiple domain support (Email, Programming, etc.)
 * - Hybrid search integration
 * - Error handling and retries
 * - Progress tracking
 * - Message formatting and storage
 */

import { performHybridSearch } from '@/lib/features/ai/utils/embedding';
import { structureResponse } from '@/lib/features/ai/utils/responseFormatter';
import { processMessages } from '../services/messageProcessor';
import { createCompletion } from '../services/completionService';
import { getContextualPrompt } from '../prompts/systemMessages';
import { ChatMessage } from '@/lib/types';
import { DOMINATION_FIELDS, DominationField } from '../config/constants';

interface AnswerQuestionResponse {
  content: string;
  chat_topic?: string;
}

interface AnswerQuestionOptions {
  messages: ChatMessage[];
  onToken: (token: string) => Promise<void>;
  dominationField?: DominationField;
  chatId: string;
  customPrompt?: string | null;
  imageFile?: string;
  model?: string;
  skipStorage?: boolean;
}

async function generateChatTopic(
  messages: ChatMessage[],
  latestUserContent: string,
  model: string
): Promise<string | undefined> {
  // Generate topic for first message or if significant conversation has occurred
  if (messages.length <= 1 || messages.length >= 3) {
    try {
      const conversation = messages.length > 0 
        ? messages
          .slice(-3) // Take last 3 messages for context
          .map(msg => `${msg.userRole}: ${msg.userContent || ''}\n${msg.assistantRole}: ${msg.assistantContent || ''}`)
          .join('\n')
        : latestUserContent;

      const topicPrompt = messages.length <= 1
        ? `Generate a concise (max 6 words) but descriptive chat topic for this message:\n\n${latestUserContent}\n\nTopic:`
        : `Based on this conversation, generate a concise (max 6 words) but descriptive chat topic that captures the main theme:\n\n${conversation}\n\nLatest message: ${latestUserContent}\n\nTopic:`;

      const topic = await createCompletion(
        [{ role: 'user', content: topicPrompt }],
        model,
        async () => {} // Empty callback since we don't need streaming for topic
      );

      return topic?.trim();
    } catch (error) {
      console.warn('Failed to generate chat topic:', error);
      // Fallback to user content for first message
      return messages.length <= 1 ? latestUserContent : undefined;
    }
  }
  return undefined;
}

export async function answerQuestion(options: AnswerQuestionOptions): Promise<AnswerQuestionResponse> {
  const {
    messages,
    onToken,
    dominationField = DOMINATION_FIELDS.NORMAL_CHAT,
    chatId,
    customPrompt = null,
    model
  } = options;

  console.log('🎯 [answerQuestion] Received options:', {
    model,
    dominationField,
    chatId,
    messageCount: messages.length,
    hasCustomPrompt: !!customPrompt,
    customPromptPreview: customPrompt ? `${customPrompt.slice(0, 50)}...` : null
  });

  try {
    console.log('🔍 [answerQuestion] Processing with model and field:', {
      model,
      dominationField,
      latestMessageLength: messages[messages.length - 1]?.userContent.length
    });

    // Get the latest user message content, ensure it's not null
    const latestUserContent = messages[messages.length - 1]?.userContent;
    if (!latestUserContent) {
      throw new Error('No user message content found');
    }

    // Format previous conversation based on domination field
    const previousConvo = messages
      .map(msg => {
        const userContent = msg.userContent || '';
        const assistantContent = msg.assistantContent || '';
        
        console.log('🔄 [answerQuestion] Formatting message with domination field:', dominationField);
        
        switch (dominationField) {
          case DOMINATION_FIELDS.EMAIL:
            return `Email ${msg.userRole}: ${userContent}\nResponse: ${assistantContent}`;
          case DOMINATION_FIELDS.RUBIN:
            return `Observer: ${userContent}\nAstronomer: ${assistantContent}`;
          case DOMINATION_FIELDS.PROGRAMMING:
            return `Question: ${userContent}\nProgrammer: ${assistantContent}`;
          case DOMINATION_FIELDS.DATA_MINING:
            return `Query: ${userContent}\nAnalyst: ${assistantContent}`;
          case DOMINATION_FIELDS.DSA:
            return `Problem: ${userContent}\nSolution: ${assistantContent}`;
          case DOMINATION_FIELDS.NORMAL_CHAT:
          default:
            return `${msg.userRole}: ${userContent}\n${msg.assistantRole}: ${assistantContent}`;
        }
      })
      .join('\n');

    // Get context for hybrid search if needed
    let contextText = '';
    if (dominationField !== DOMINATION_FIELDS.NORMAL_CHAT) {
      try {
        const searchResults = await performHybridSearch(latestUserContent, dominationField);
        contextText = searchResults.map(doc => doc.content).join('\n');
      } catch (error) {
        console.warn('Warning: Hybrid search failed, continuing without context:', error);
        // Continue without context rather than failing the whole request
      }
    }

    // Create the system message with all required parameters
    const systemMessage = getContextualPrompt(
      dominationField,
      previousConvo,
      latestUserContent,
      contextText,
      customPrompt
    );

    console.log('📝 [answerQuestion] Created system message:', {
      dominationField,
      messageLength: systemMessage.length,
      hasCustomPrompt: !!customPrompt,
      customPromptLength: customPrompt?.length || 0,
      systemMessagePreview: `${systemMessage.slice(0, 100)}...`
    });

    // Process messages for context
    const processedMessages = await processMessages(
      messages,
      latestUserContent,
      systemMessage
    );

    console.log('✅ [answerQuestion] Messages processed:', {
      processedMessageCount: processedMessages.length,
      firstMessagePreview: processedMessages[0] ? `${processedMessages[0].content.slice(0, 50)}...` : null
    });

    // Create completion with proper error handling
    let fullResponse = '';
    try {
      console.log('🔍 [answerQuestion] Calling createCompletion:', {
        model,
        dominationField,
        processedMessageCount: processedMessages.length,
        customPromptUsed: !!customPrompt
      });

      fullResponse = await createCompletion(
        processedMessages,
        model || 'default',
        onToken
      );
      
      if (!fullResponse?.trim()) {
        console.log('Empty response, retrying...');
        const retryPrompt = getDomainSpecificRetryPrompt(dominationField, latestUserContent);
        fullResponse = await createCompletion(
          [{ role: 'user', content: retryPrompt }],
          model || 'default',
          onToken
        );
      }
    } catch (error) {
      console.error('Completion error:', error);
      throw new Error('Failed to generate response');
    }

    if (!fullResponse?.trim()) {
      throw new Error('Unable to generate a valid response');
    }

    // Generate chat topic if needed
    const chat_topic = await generateChatTopic(messages, latestUserContent, model || 'default');

    const structuredResponse = {
      content: structureResponse(fullResponse),
      chat_topic
    };

    console.log('✨ Generated response:', {
      responseLength: structuredResponse.content.length,
      hasChatTopic: !!chat_topic,
      chatTopic: chat_topic
    });

    return structuredResponse;

  } catch (error) {
    console.error('Error in answerQuestion:', error);
    throw error;
  }
}

function getDomainSpecificRetryPrompt(dominationField: DominationField, message: string): string {
  switch (dominationField) {
    case DOMINATION_FIELDS.EMAIL:
      return `Please compose a professional email response to: ${message}`;
    case DOMINATION_FIELDS.RUBIN:
      return `As an astronomer at Rubin Observatory, please answer this question: ${message}`;
    case DOMINATION_FIELDS.PROGRAMMING:
      return `As a programming language expert, please explain: ${message}`;
    case DOMINATION_FIELDS.DATA_MINING:
      return `As a data mining specialist, please analyze: ${message}`;
    case DOMINATION_FIELDS.DSA:
      return `As an algorithms expert, please solve: ${message}`;
    case DOMINATION_FIELDS.NORMAL_CHAT:
    default:
      return `Please answer this question clearly and directly: ${message}`;
  }
} 