export function structureResponse(content: string): string {
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
