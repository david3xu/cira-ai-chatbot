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

import { DOMINATION_FIELDS, DEFAULT_PROMPT } from '../config/constants';
import { DominationField } from './types';
import { codeBlock } from 'common-tags';
import { MessageContent } from '@/lib/types/database';

export function getSystemMessage(dominationField: DominationField, customPrompt?: string | null): string {
  const baseMessage = (() => {
    switch (dominationField) {
      case DOMINATION_FIELDS.PROGRAMMING:
        return 'You are a helpful assistant specializing in programming languages, design patterns, and software development. When users share code files or documents, analyze them and provide relevant insights.';
      case DOMINATION_FIELDS.DATA_MINING:
        return 'You are a helpful assistant specializing in data mining techniques, algorithms, and applications. When users share data files or documents, analyze them and provide relevant insights.';
      case DOMINATION_FIELDS.DSA:
        return 'You are a helpful assistant specializing in data structures, algorithms, and computational complexity. When users share code files or documents, analyze them and provide relevant insights.';
      case DOMINATION_FIELDS.EMAIL:
        return 'You are a helpful assistant specializing in email communication and professional writing. When users share documents or attachments, analyze them and provide relevant insights.';
      case DOMINATION_FIELDS.RUBIN:
        return 'You are a helpful assistant specializing in Rubin Observatory and astronomical observations. When users share data files, images, or documents, analyze them and provide relevant insights.';
      case DOMINATION_FIELDS.NORMAL_CHAT:
      default:
        return `${DEFAULT_PROMPT} When users share files or attachments, I will acknowledge them and provide relevant insights based on their content. For images, I will describe what I see. For documents, I will analyze their content and purpose.`;
    }
  })();

  return customPrompt ? `${baseMessage}\n\nCustom Instructions:\n${customPrompt}` : baseMessage;
}

function getTextContent(content: string | MessageContent[]): string {
  if (Array.isArray(content)) {
    return content.map(c => c.type === 'text' ? c.text : '[Image]').join(' ');
  }
  return content;
}

export function getContextualPrompt(
  dominationField: DominationField,
  previousConvo: string,
  latestUserContent: string | MessageContent[],
  contextText: string
): string {
  console.log('🎯 [systemMessages] Generating prompt for:', {
    dominationField,
    contentLength: typeof latestUserContent === 'string' ? latestUserContent.length : latestUserContent.length
  });

  const formattedContent = getTextContent(latestUserContent);

  switch (dominationField) {
    case DOMINATION_FIELDS.PROGRAMMING:
      console.log('📝 Using Programming Languages prompt');
      return getProgrammingPrompt(previousConvo, formattedContent);
    case DOMINATION_FIELDS.DATA_MINING:
      console.log('📝 Using Data Mining prompt');
      return getDataMiningPrompt(previousConvo, formattedContent);
    case DOMINATION_FIELDS.DSA:
      console.log('📝 Using DSA prompt');
      return getDSAPrompt(previousConvo, formattedContent);
    case DOMINATION_FIELDS.EMAIL:
      return getEmailPrompt(previousConvo, formattedContent);
    case DOMINATION_FIELDS.RUBIN:
      return getRubinPrompt(previousConvo, formattedContent);
    case DOMINATION_FIELDS.NORMAL_CHAT:
    default:
      console.log('📝 Using Normal Chat prompt');
      return getNormalChatPrompt(previousConvo, formattedContent);
  }
}

export function getNormalChatPrompt(
  previousConvo: string,
  latestUserContent: string
): string {
  return `Previous conversation:
${previousConvo}

Current question:
${latestUserContent}`;
}

export function getProgrammingPrompt(
  previousConvo: string,
  sanitizedQuery: string
): string {
  return codeBlock`
    You are an AI assistant specializing in programming languages. Your task is to provide accurate and detailed responses about programming language concepts, design patterns, and implementation details.

    Previous conversation:
    ${previousConvo}

    Current question: """
    ${sanitizedQuery}
    """

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
  sanitizedQuery: string
): string {
  return codeBlock`
    You are an AI assistant specializing in data mining. Your task is to provide accurate and detailed responses about data mining concepts, techniques, and applications.

    Previous conversation:
    ${previousConvo}

    Current question: """
    ${sanitizedQuery}
    """

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
  sanitizedQuery: string
): string {
  console.log('📝 [getDSAPrompt] Creating prompt with:', {
    previousConvoLength: previousConvo.length,
    queryLength: sanitizedQuery.length
  });

  return codeBlock`
    You are an AI assistant specializing in data structures and algorithms. Your task is to provide accurate and detailed responses about algorithmic concepts, complexity analysis, and implementation details.

    Previous conversation:
    ${previousConvo}

    Current question: """
    ${sanitizedQuery}
    """

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

export function getEmailPrompt(previousConvo: string, sanitizedQuery: string) {
  return codeBlock`
    You are an AI assistant specializing in email communication. Your task is to compose a response to an email based on the user's request.

    Previous conversation:
    ${previousConvo}

    Current request: """
    ${sanitizedQuery}
    """

    Instructions:
    - Compose a response to the email based on the request
    - Use appropriate greetings and closings
    - Format properly with markdown
    - Be professional and concise

    Email Response:
  `;
}

export function getRubinPrompt(
  previousConvo: string,
  sanitizedQuery: string
): string {
  return codeBlock`
    You are an AI assistant specializing in Rubin Observatory and astronomical observations. Your task is to provide accurate and informative responses about astronomy, with a focus on the Rubin Observatory's capabilities and research.

    Previous conversation:
    ${previousConvo}

    Current question: """
    ${sanitizedQuery}
    """

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

export function formatConversationByDomain(
  dominationField: DominationField,
  userContent: string | MessageContent[],
  assistantContent: string
): string {
  const formattedUserContent = Array.isArray(userContent) 
    ? userContent.map(c => c.type === 'text' ? c.text : '[Image]').join(' ') 
    : userContent;

  switch (dominationField) {
    case DOMINATION_FIELDS.EMAIL:
      return `Email: ${formattedUserContent}\nResponse: ${assistantContent}`;
    case DOMINATION_FIELDS.RUBIN:
      return `Observer: ${formattedUserContent}\nAstronomer: ${assistantContent}`;
    case DOMINATION_FIELDS.PROGRAMMING:
      return `Question: ${formattedUserContent}\nProgrammer: ${assistantContent}`;
    case DOMINATION_FIELDS.DATA_MINING:
      return `Query: ${formattedUserContent}\nAnalyst: ${assistantContent}`;
    case DOMINATION_FIELDS.DSA:
      return `Problem: ${formattedUserContent}\nSolution: ${assistantContent}`;
    case DOMINATION_FIELDS.NORMAL_CHAT:
    default:
      return `User: ${formattedUserContent}\nAssistant: ${assistantContent}`;
  }
} 