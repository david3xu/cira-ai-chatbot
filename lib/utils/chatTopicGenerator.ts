export function generateChatTopic(userContent?: string, assistantContent?: string): string {
  if (!userContent && !assistantContent) return '';

  const combined = `${userContent || ''} ${assistantContent || ''}`.trim();
  
  // Try to get first sentence
  const sentenceMatch = combined.match(/^[^.!?]+[.!?]/);
  if (sentenceMatch) {
    return sentenceMatch[0].trim();
  }
  
  // Fallback to first 50 characters
  return combined.length > 50 ? 
    `${combined.substring(0, 50)}...` : 
    combined;
} 