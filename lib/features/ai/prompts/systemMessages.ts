import { DOMINATION_FIELDS } from '../config/constants';
import { codeBlock } from 'common-tags';

export function getSystemMessage(dominationField: string): string {
  switch (dominationField) {
    case DOMINATION_FIELDS.RUBIN:
      return 'You are a helpful assistant specializing in Rubin Observatory and astronomical observations.';
    case DOMINATION_FIELDS.NORMAL_CHAT:
      return 'You are a friendly and helpful general-purpose assistant.';
    case DOMINATION_FIELDS.EMAIL:
      return 'You are a helpful assistant specializing in email composition and communication.';
    default:
      return 'You are a helpful assistant specializing in marking programming language design assignments.';
  }
}

export function getContextualPrompt(
  dominationField: string,
  previousConvo: string,
  sanitizedQuery: string,
  contextText: string = '',
  customPrompt?: string
): string {
  const basePrompt = codeBlock`
    Basic requirements:
    1. Focus on answering the question.
    2. Depending on the chat question, consider including chat history as input content.
    3. Answer questions with good structure and logic.
    ${customPrompt ? `\n${customPrompt}\n\n` : '\n'}
  `;

  switch (dominationField) {
    case DOMINATION_FIELDS.NORMAL_CHAT:
      return basePrompt + getNormalChatPrompt(previousConvo, sanitizedQuery);
    case DOMINATION_FIELDS.EMAIL:
      return getEmailPrompt(previousConvo, sanitizedQuery, customPrompt);
    default:
      return basePrompt + getDocumentPrompt(contextText, previousConvo, sanitizedQuery);
  }
}

function getNormalChatPrompt(previousConvo: string, sanitizedQuery: string) {
  return codeBlock`
    You are a friendly AI assistant. Be helpful, empathetic, and engaging.

    Previous conversation:
    ${previousConvo}

    Current message: """
    ${sanitizedQuery}
    """

    Instructions:
    - Be conversational and friendly
    - Acknowledge previous context if relevant
    - Keep responses concise
    - Use simple bullet points for multiple points

    Response:
  `;
}

function getDocumentPrompt(contextText: string, previousConvo: string, sanitizedQuery: string) {
  return codeBlock`
    Context information:
    ${contextText}

    Previous conversation:
    ${previousConvo}

    Current question: """
    ${sanitizedQuery}
    """

    Instructions:
    - Answer using documents, conversation history, and relevant context
    - Focus on textual information
    - Acknowledge previous context when referenced
    - Format in markdown for readability
    - Be concise but thorough

    Answer:
  `;
}

function getEmailPrompt(previousConvo: string, sanitizedQuery: string, customPrompt?: string) {
  const action = customPrompt?.toLowerCase().includes('rewrite') ? 'rewrite' : 'answer';
  
  return codeBlock`
    You are an AI assistant specializing in email communication. Your task is to ${action === 'answer' ? 'compose a response to' : 'rewrite'} an email based on the user's request.

    Previous conversation:
    ${previousConvo}

    Current request: """
    ${sanitizedQuery}
    """

    ${customPrompt ? `Custom instructions: ${customPrompt}\n` : ''}

    Instructions:
    - ${action === 'answer' ? 'Compose a response to the email' : 'Rewrite the email'} based on the request
    - Use appropriate greetings and closings
    - Format properly with markdown
    - Be professional and concise

    ${action === 'answer' ? 'Email Response' : 'Rewritten Email'}:
  `;
} 