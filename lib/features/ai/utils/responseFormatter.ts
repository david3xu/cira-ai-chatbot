/**
 * Response Formatter
 * 
 * Formats AI responses with:
 * - Markdown cleanup
 * - Code block formatting
 * - List standardization
 * 
 * Features:
 * - Artifact removal
 * - Consistent formatting
 * - Code block handling
 * - List normalization
 */

export function structureResponse(response: string): string {
  // Remove any potential system message artifacts
  response = response.replace(/^(Assistant|System|AI):\s*/i, '');
  
  // Clean up markdown formatting
  response = response
    .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
    .replace(/\s+$/gm, '')       // Remove trailing whitespace
    .trim();

  // Ensure code blocks are properly formatted
  response = response.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || '';
    const formattedCode = code.trim();
    return `\`\`\`${language}\n${formattedCode}\n\`\`\``;
  });

  // Ensure lists are properly formatted
  response = response.replace(/^[•●∙]\s/gm, '- ');  // Convert bullets to markdown list
  
  return response;
} 