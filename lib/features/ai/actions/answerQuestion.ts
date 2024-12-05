import { performHybridSearch } from '@/lib/features/ai/utils/embedding';
import { structureResponse } from '@/lib/features/ai/utils/responseFormatter';
import { processMessages } from '../services/messageProcessor';
import { createCompletion } from '../services/completionService';
import { getContextualPrompt } from '../prompts/systemMessages';
// import { FormattedMessage } from '@/lib/types/chat/formattedMessage';
import { saveMessagePair } from '@/lib/features/chat/actions/storeMessage';
import { ChatMessage } from '@/lib/types/chat/chat';
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

export async function answerQuestion(options: AnswerQuestionOptions): Promise<AnswerQuestionResponse> {
  const {
    messages,
    onToken,
    dominationField = DOMINATION_FIELDS.NORMAL_CHAT,
    chatId,
    customPrompt = null,
    imageFile,
    model,
    skipStorage = false
  } = options;

  console.log('🎯 [answerQuestion] Starting with options:', {
    dominationField,
    chatId,
    model,
    messageCount: messages.length
  });

  try {
    console.log('Starting answerQuestion with model:', model);

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

    console.log('📝 [answerQuestion] Created system message with domination field:', {
      dominationField,
      messageLength: systemMessage.length
    });

    // Process messages for context
    const processedMessages = await processMessages(
      messages,
      latestUserContent,
      systemMessage
    );

    console.log('✅ [answerQuestion] Messages processed, sending to model');

    // Create completion
    let fullResponse = await createCompletion(
      processedMessages,
      model || 'default',
      onToken
    );

    // Handle empty responses with domain-specific retry
    if (!fullResponse?.trim()) {
      console.log('Empty response received, retrying with domain-specific prompt...');
      const retryPrompt = getDomainSpecificRetryPrompt(dominationField, latestUserContent);
      fullResponse = await createCompletion(
        [{ role: 'user', content: retryPrompt }],
        model || 'default',
        onToken
      );

      if (!fullResponse?.trim()) {
        throw new Error('Unable to generate a valid response after retry');
      }
    }

    // Save messages if storage is not skipped
    if (!skipStorage) {
      try {
        const messagePairId = crypto.randomUUID();
        const userMessage: ChatMessage = {
          id: crypto.randomUUID(),
          chatId,
          messagePairId,
          userContent: latestUserContent,
          assistantContent: null,
          userRole: 'user',
          assistantRole: 'assistant',
          model: model || 'default',
          dominationField,
          customPrompt: customPrompt || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'sending'
        };

        const assistantMessage: ChatMessage = {
          ...userMessage,
          id: crypto.randomUUID(),
          userContent: null,
          assistantContent: fullResponse,
          status: 'success'
        };

        await saveMessagePair(userMessage, assistantMessage);
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    }

    // Return the structured response with proper typing
    return {
      content: structureResponse(fullResponse),
      chat_topic: messages.length === 0 ? latestUserContent : undefined
    };

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