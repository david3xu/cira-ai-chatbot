export function getSystemMessage(dominationField: string): string {
  switch (dominationField) {
    case 'Rubin Observation':
      return 'You are a helpful assistant specializing in Rubin Observatory and astronomical observations.';
    case 'Normal Chat':
      return 'You are a friendly and helpful general-purpose assistant.';
    case 'Email':
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
  const basePrompt = `Basic requirements:
1. Focus on answering the question.
2. Depending on the chat question, consider including chat history as input content.
3. Answer questions with good structure and logic.
${customPrompt ? `\n${customPrompt}\n\n` : '\n'}`;

  if (dominationField === 'Normal Chat') {
    return basePrompt + getNormalChatPrompt(previousConvo, sanitizedQuery);
  } else if (dominationField === 'Email') {
    return getEmailPrompt(previousConvo, sanitizedQuery, customPrompt);
  } else {
    return basePrompt + getDocumentPrompt(contextText, previousConvo, sanitizedQuery);
  }
}

function getNormalChatPrompt(previousConvo: string, query: string): string {
  return `Previous conversation:
${previousConvo}

Current question: ${query}

Please provide a helpful response.`;
}

function getEmailPrompt(previousConvo: string, query: string, customPrompt?: string): string {
  return `${customPrompt || ''}

Previous conversation:
${previousConvo}

Current request: ${query}

Please help compose or analyze the email as requested.`;
}

function getDocumentPrompt(contextText: string, previousConvo: string, query: string): string {
  return `Context information:
${contextText}

Previous conversation:
${previousConvo}

Current question: ${query}

Please provide a detailed response based on the context provided.`;
}
