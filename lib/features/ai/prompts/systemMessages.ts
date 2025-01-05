/**
 * System Messages Generator
 * 
 * Manages AI system prompts with:
 * - Domain-specific prompting
 * - Context integration
 * - Custom prompt support
 * 
 * Features:
 * - Multiple domain templates
 * - Dynamic prompt generation
 * - Conversation history integration
 * - Custom instruction support
 * - Markdown formatting
 */

import { DOMINATION_FIELDS, DominationField } from '../config/constants';
import { codeBlock } from 'common-tags';

export function getSystemMessage(dominationField: DominationField): string {
  switch (dominationField) {
    case DOMINATION_FIELDS.RUBIN:
      return 'You are a helpful assistant specializing in Rubin Observatory and astronomical observations.';
    case DOMINATION_FIELDS.PROGRAMMING:
      return 'You are a helpful assistant specializing in programming language concepts, design, and implementation.';
    case DOMINATION_FIELDS.DATA_MINING:
      return 'You are a helpful assistant specializing in data mining techniques, algorithms, and applications.';
    case DOMINATION_FIELDS.DSA:
      return 'You are a helpful assistant specializing in data structures, algorithms, and computational complexity.';
    case DOMINATION_FIELDS.EMAIL:
      return 'You are a helpful assistant specializing in email composition and communication.';
    case DOMINATION_FIELDS.NORMAL_CHAT:
    default:
      return 'You are a friendly and helpful general-purpose assistant.';
  }
}

export function getContextualPrompt(
  dominationField: DominationField,
  previousConvo: string,
  latestUserContent: string,
  contextText: string,
  customPrompt?: string | null
): string {
  console.log('🎯 [systemMessages] Generating prompt for:', {
    dominationField,
    hasCustomPrompt: !!customPrompt,
    contentLength: latestUserContent.length
  });

  const prompt = customPrompt || undefined;

  switch (dominationField) {
    case DOMINATION_FIELDS.PROGRAMMING:
      console.log('📝 Using Programming Languages prompt');
      return getProgrammingPrompt(previousConvo, latestUserContent, prompt);
    case DOMINATION_FIELDS.DATA_MINING:
      console.log('📝 Using Data Mining prompt');
      return getDataMiningPrompt(previousConvo, latestUserContent, prompt);
    case DOMINATION_FIELDS.DSA:
      return getDSAPrompt(previousConvo, latestUserContent, prompt);
    case DOMINATION_FIELDS.EMAIL:
      return getEmailPrompt(previousConvo, latestUserContent, prompt);
    case DOMINATION_FIELDS.RUBIN:
      return getRubinPrompt(previousConvo, latestUserContent, prompt);
    case DOMINATION_FIELDS.NORMAL_CHAT:
    default:
      return getNormalChatPrompt(previousConvo, latestUserContent, prompt);
  }
}

export function getNormalChatPrompt(
  previousConvo: string,
  latestUserContent: string,
  customPrompt?: string
): string {
  return `${customPrompt ? `${customPrompt}\n\n` : ''}
Previous conversation:
${previousConvo}

Current question:
${latestUserContent}`;
}

export function getProgrammingPrompt(
  previousConvo: string,
  sanitizedQuery: string,
  customPrompt?: string
): string {
  return codeBlock`
    You are an AI assistant specializing in programming languages. Your task is to provide accurate and detailed responses about programming language concepts, design patterns, and implementation details.

    Previous conversation:
    ${previousConvo}

    Current question: """
    ${sanitizedQuery}
    """

    ${customPrompt ? `Custom instructions: ${customPrompt}\n` : ''}

    Instructions:
    - Provide accurate programming language information
    - Include relevant code examples when appropriate
    - Explain concepts clearly with proper terminology
    - Format code blocks with appropriate syntax highlighting
    - Consider best practices and design patterns
    - Format responses with markdown for readability
    - Include performance considerations when relevant

    Response:
  `;
}

export function getDataMiningPrompt(
  previousConvo: string,
  sanitizedQuery: string,
  customPrompt?: string
): string {
  return codeBlock`
    You are an AI assistant specializing in data mining. Your task is to provide accurate and detailed responses about data mining concepts, techniques, and applications.

    Previous conversation:
    ${previousConvo}

    Current question: """
    ${sanitizedQuery}
    """

    ${customPrompt ? `Custom instructions: ${customPrompt}\n` : ''}

    Instructions:
    - Provide accurate data mining information
    - Explain algorithms and techniques clearly
    - Include relevant statistical concepts
    - Consider practical applications and use cases
    - Format responses with markdown for readability
    - Include implementation considerations
    - Reference appropriate tools and libraries when relevant

    Response:
  `;
}

export function getDSAPrompt(
  previousConvo: string,
  sanitizedQuery: string,
  customPrompt?: string
): string {
  return codeBlock`
    You are an AI assistant specializing in data structures and algorithms. Your task is to provide accurate and detailed responses about algorithmic concepts, complexity analysis, and implementation details.

    Previous conversation:
    ${previousConvo}

    Current question: """
    ${sanitizedQuery}
    """

    ${customPrompt ? `Custom instructions: ${customPrompt}\n` : ''}

    Instructions:
    - Provide accurate algorithm and data structure information
    - Include time and space complexity analysis
    - Explain concepts with clear examples
    - Use proper computer science terminology
    - Include pseudocode or implementation details when relevant
    - Format code examples with appropriate syntax
    - Consider edge cases and optimization techniques
    - Format responses with markdown for readability

    Response:
  `;
}

export function getDocumentPrompt(contextText: string, previousConvo: string, sanitizedQuery: string) {
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

export function getEmailPrompt(previousConvo: string, sanitizedQuery: string, customPrompt?: string) {
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

export function getRubinPrompt(
  previousConvo: string,
  sanitizedQuery: string,
  customPrompt?: string
): string {
  return codeBlock`
    You are an AI assistant specializing in Rubin Observatory and astronomical observations. Your task is to provide accurate and informative responses about astronomy, with a focus on the Rubin Observatory's capabilities and research.

    Previous conversation:
    ${previousConvo}

    Current question: """
    ${sanitizedQuery}
    """

    ${customPrompt ? `Custom instructions: ${customPrompt}\n` : ''}

    Instructions:
    - Provide accurate astronomical information
    - Focus on Rubin Observatory's capabilities when relevant
    - Explain complex concepts clearly
    - Use proper astronomical terminology
    - Include relevant observational details
    - Format responses with markdown for readability
    - Be precise with numerical values and units
    - Acknowledge uncertainties when appropriate

    Response:
  `;
} 