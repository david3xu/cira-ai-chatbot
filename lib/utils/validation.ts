/**
 * Validation Utilities
 * 
 * Common validation functions:
 * - Input validation
 * - Type checking
 * - Format verification
 */

export function isValidMessageContent(content: string): boolean {
  return content.trim().length > 0 && content.length <= 4000;
}

export function isValidFile(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
} = {}): boolean {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options;
  
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  if (allowedTypes.length && !allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} not supported`);
  }

  return true;
}

export function validateChat(chat: any): boolean {
  if (!chat?.id || typeof chat.id !== 'string') {
    throw new Error('Invalid chat ID');
  }

  if (!Array.isArray(chat.messages)) {
    throw new Error('Chat messages must be an array');
  }

  return true;
}
