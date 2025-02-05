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
 * - Image support
 */

import { performHybridSearch } from '@/lib/features/ai/utils/embedding';
import { structureResponse } from '@/lib/features/ai/utils/responseFormatter';
import { processMessages } from '../services/messageProcessor';
import { createCompletion } from '../services/completionService';
import { getContextualPrompt, getSystemMessage, formatConversationByDomain } from '@/lib/features/ai/prompts/systemMessages';
import { ChatMessage } from '@/lib/types';
import { DOMINATION_FIELDS, DominationField } from '../config/constants';
import { MessageContent } from '@/lib/types/chat';

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
  imageDetail?: 'low' | 'high' | 'auto';
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
    dominationField,
    customPrompt,
    chatId,
    imageFile,
    imageDetail = 'auto',
    model
  } = options;

  console.log('🎯 [answerQuestion] Received options:', {
    model,
    dominationField,
    chatId,
    messageCount: messages.length,
    hasCustomPrompt: !!customPrompt,
    hasImage: !!imageFile,
    customPromptPreview: customPrompt
  });

  try {
    // Get the latest user message content, ensure it's not null
    const latestUserContent = messages[messages.length - 1]?.userContent;
    if (!latestUserContent) {
      throw new Error('No user message content found');
    }

    // Convert array content to text where needed
    const getTextContent = (content: string | MessageContent[]) => 
      Array.isArray(content) 
        ? content.map(c => c.type === 'text' ? c.text : '').join(' ')
        : content;

    // Calculate word importance based on frequency
    const calculateWordImportance = (text: string): Map<string, number> => {
      const words = text.toLowerCase().split(/\s+/);
      const wordFreq = new Map<string, number>();
      words.forEach(word => {
        if (word.length > 3) {  // Skip short words
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      });
      return wordFreq;
    };

    // Calculate relevance score between two texts
    const calculateRelevance = (currentText: string, historicalText: string): number => {
      const currentWords = calculateWordImportance(currentText);
      const historicalWords = calculateWordImportance(historicalText);
      
      let score = 0;
      let matches = 0;
      
      // Score based on matching words and their frequencies
      currentWords.forEach((freq, word) => {
        if (historicalWords.has(word)) {
          matches++;
          // Higher score for less frequent words (potentially more meaningful)
          score += 1 / freq;
        }
      });
      
      // Normalize score by text lengths to avoid bias towards longer texts
      const lengthFactor = Math.sqrt(currentText.split(/\s+/).length * historicalText.split(/\s+/).length);
      return matches > 0 ? (score * matches) / lengthFactor : 0;
    };

    // Smart context selection from conversation history
    const getRelevantMessages = (messages: ChatMessage[], currentContent: string | MessageContent[]) => {
      if (messages.length <= 2) return messages;

      // Always include the last message (current question)
      const relevantMessages = [messages[messages.length - 1]];
      
      // Include the last exchange for immediate context
      if (messages.length >= 2) {
        relevantMessages.unshift(messages[messages.length - 2]);
      }

      // Look for semantically related earlier messages
      const currentContentText = getTextContent(currentContent);
      const earlierMessages = messages.slice(0, -2);
      
      // Calculate relevance scores for all earlier messages
      const scoredMessages = earlierMessages.map(msg => ({
        message: msg,
        score: calculateRelevance(
          currentContentText,
          getTextContent(msg.userContent || '')
        )
      })).filter(item => item.score > 0)  // Only keep messages with some relevance
        .sort((a, b) => b.score - a.score);  // Sort by relevance score
      
      // Add top scoring messages
      scoredMessages.slice(0, 2).forEach(item => {
        relevantMessages.unshift(item.message);
      });

      return relevantMessages;
    };

    // Format previous conversation based on domination field with smart context
    const previousConvo = getRelevantMessages(messages, latestUserContent)
      .map(msg => {
        const userContent = getTextContent(msg.userContent || '');
        const assistantContent = msg.assistantContent || '';
        return formatConversationByDomain(
          dominationField || DOMINATION_FIELDS.NORMAL_CHAT,
          userContent,
          assistantContent
        );
      })
      .join('\n');

    // Get context for hybrid search if needed
    let contextText = '';
    if (dominationField && dominationField !== DOMINATION_FIELDS.NORMAL_CHAT) {
      try {
        const searchResults = await performHybridSearch(
          getTextContent(latestUserContent),
          dominationField,
          5, // match_count
          1.0, // full_text_weight
          1.0, // semantic_weight
          50 // rrf_k
        );
        contextText = searchResults.map(doc => doc.content).join('\n');
      } catch (error) {
        console.warn('Warning: Hybrid search failed, continuing without context:', error);
      }
    }

    console.log('🔍 [answerQuestion] Context text:', {
      contextText,
      dominationField,
      customPrompt
    });

    // Get the base system message - only use custom prompt here
    const systemMessage = getSystemMessage(dominationField || DOMINATION_FIELDS.NORMAL_CHAT, customPrompt);

    // Create the contextual prompt with only current question and search results
    const prompt = getContextualPrompt(
      dominationField || DOMINATION_FIELDS.NORMAL_CHAT,
      previousConvo,
      getTextContent(latestUserContent),
      contextText
    );

    // Create completion with proper error handling
    let fullResponse = '';
    try {
      const { messages: processedMessages, hasVisionContent } = await processMessages(
        [messages[messages.length - 1]], // Only use current message
        prompt,
        systemMessage,
        imageFile,
        imageDetail
      );

      fullResponse = await createCompletion(
        processedMessages,
        model || 'default',
        onToken,
        hasVisionContent
      );
      
      if (!fullResponse?.trim()) {
        const retryPrompt = getContextualPrompt(
          dominationField || DOMINATION_FIELDS.NORMAL_CHAT,
          '', // empty previous convo for retry
          latestUserContent,
          contextText
        );
        // No vision content in retry
        fullResponse = await createCompletion(
          [{ role: 'user', content: retryPrompt }],
          model || 'default',
          onToken,
          false // No vision content in retry
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
    const chat_topic = await generateChatTopic(
      messages,
      getTextContent(latestUserContent),
      model || 'default'
    );

    const structuredResponse = {
      content: structureResponse(fullResponse),
      chat_topic
    };

    return structuredResponse;

  } catch (error) {
    console.error('Error in answerQuestion:', error);
    throw error;
  }
} 