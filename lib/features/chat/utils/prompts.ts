import { ChatMessage } from '../types/chat';

export const formatPreviousConversation = (messages: ChatMessage[]): string => {
  return messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n\n');
};

export const getNormalChatPrompt = (previousConvo: string, query: string): string => {
  return `Previous conversation:
${previousConvo}

Current question: ${query}

Please provide a helpful response.`;
};

export const getEmailPrompt = (previousConvo: string, query: string, customPrompt?: string): string => {
  return `${customPrompt || ''}

Previous conversation:
${previousConvo}

Current request: ${query}

Please help compose or analyze the email as requested.`;
};

export const getDocumentPrompt = (contextText: string, previousConvo: string, query: string): string => {
  return `Context information:
${contextText}

Previous conversation:
${previousConvo}

Current question: ${query}

Please provide a detailed response based on the context provided.`;
};

export const getPromptByDominationField = (
  dominationField: string,
  previousConvo: string,
  query: string,
  customPrompt?: string,
  contextText?: string
): string => {
  switch (dominationField) {
    case 'Email':
      return getEmailPrompt(previousConvo, query, customPrompt);
    case 'Document':
      if (!contextText) throw new Error('Context text is required for Document prompts');
      return getDocumentPrompt(contextText, previousConvo, query);
    case 'Normal Chat':
    default:
      return getNormalChatPrompt(previousConvo, query);
  }
};

export const createSystemMessage = (
  dominationField: string,
  customPrompt?: string
): string => {
  switch (dominationField) {
    case 'Email':
      return customPrompt || 'You are an email assistant. Help users compose and analyze emails professionally.';
    case 'Document':
      return 'You are a document analysis assistant. Help users understand and work with document content.';
    case 'Normal Chat':
    default:
      return 'You are a helpful assistant. Provide clear and accurate responses to user queries.';
  }
}; 