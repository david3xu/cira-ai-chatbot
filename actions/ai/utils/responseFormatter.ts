export function structureResponse(content: string | any): string {
  // If content is not a string, try to extract text
  if (typeof content !== 'string') {
    if (content.text) return content.text;
    if (content.content) return content.content;
    return '';
  }

  if (!content.trim()) return content;

  const paragraphs = content
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => p.trim());
    
  if (paragraphs.length === 0) return content;
  if (paragraphs.length === 1) return paragraphs[0];

  return paragraphs
    .map((p, i) => {
      if (i === 0 || i === paragraphs.length - 1) return p;
      return `• ${p}`;
    })
    .join('\n');
}
