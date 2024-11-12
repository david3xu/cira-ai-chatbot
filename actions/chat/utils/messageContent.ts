export const truncateMessageContent = (content: string, maxBytes: number = 8000): string => {
  const encoder = new TextEncoder();
  const contentBytes = encoder.encode(content);
  
  if (contentBytes.length <= maxBytes) {
    return content;
  }
  
  if (content.includes('data:image')) {
    const parts = content.split(',');
    const header = parts[0] + ',';
    const base64Data = parts[1];
    
    const headerBytes = encoder.encode(header).length;
    const maxBase64Length = Math.floor((maxBytes - headerBytes - 20) * 0.75);
    
    return header + base64Data.substring(0, maxBase64Length);
  }
  
  let truncated = content;
  while (encoder.encode(truncated).length > maxBytes) {
    truncated = truncated.slice(0, Math.floor(truncated.length * 0.9));
  }
  
  return truncated + '... (truncated)';
};
