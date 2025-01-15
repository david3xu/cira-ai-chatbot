import { FormattedMessage, MessageContent } from '@/lib/types/chat';

interface MessageAttachment {
  fileType?: string;
  metadata?: {
    base64Data: string;
    imageDetail?: string;
  };
}

export function processMessage(message: any): FormattedMessage {
  console.log('📥 Processing message:', {
    role: message.role || 'user',
    hasAttachments: !!message.metadata?.attachments?.length,
    isImage: message.type === 'image',
    hasContent: !!(message.userContent || message.content)
  });

  // Ensure required fields
  if (!message.role) {
    message.role = 'user';
  }

  // Handle messages with attachments in metadata
  if (message.metadata?.attachments?.length > 0 || message.type === 'image') {
    const content: MessageContent[] = [];
    
    // Add text content if present
    if (message.userContent || message.content) {
      content.push({
        type: 'text' as const,
        text: message.userContent || message.content || "What's in this image?"
      });
      console.log('📝 Added text content:', message.userContent || message.content);
    }
    
    // Add image attachments from metadata
    if (message.metadata?.attachments) {
      message.metadata.attachments.forEach((attachment: any) => {
        if (attachment.fileType?.startsWith('image/') && attachment.metadata?.base64Data) {
          const imageContent: MessageContent = {
            type: 'image_url',
            image_url: {
              url: `data:${attachment.fileType};base64,${attachment.metadata.base64Data}`,
              detail: attachment.metadata.imageDetail || 'auto'
            }
          };
          content.push(imageContent);
          console.log('📸 Added image:', {
            fileType: attachment.fileType,
            detail: attachment.metadata.imageDetail || 'auto',
            urlStart: imageContent.image_url.url.substring(0, 50) + '...'
          });
        }
      });
    }

    // Ensure we have valid content
    if (content.length === 0) {
      console.log('⚠️ No valid content found, using default text');
      return {
        role: message.role,
        content: message.userContent || message.content || '',
        metadata: { hasVisionContent: false }
      };
    }

    const result: FormattedMessage = {
      role: message.role,
      content,
      metadata: {
        hasVisionContent: content.some(c => c.type === 'image_url')
      }
    };

    console.log('✨ Processed message:', {
      role: result.role,
      contentTypes: content.map(c => c.type),
      hasVision: result.metadata?.hasVisionContent,
      contentCount: content.length,
      content: content.map(c => ({ type: c.type, ...(c.type === 'text' ? { text: c.text } : {}) }))
    });

    return result;
  }

  // Handle text-only messages
  return {
    role: message.role,
    content: message.userContent || message.content || '',
    metadata: {
      hasVisionContent: false
    }
  };
}

export async function processMessages(
  messages: any[],
  latestContent: string,
  systemMessage: string,
  imageFile?: string,
  imageDetail: 'low' | 'high' | 'auto' = 'auto'
): Promise<{ messages: FormattedMessage[], hasVisionContent: boolean }> {
  const formattedMessages: FormattedMessage[] = [];
  let hasVisionContent = false;

  // Add system message
  formattedMessages.push({
    role: 'system',
    content: systemMessage,
    metadata: { hasVisionContent: false }
  });

  // Process all messages except the last one - keep only text content
  for (let i = 0; i < messages.length - 1; i++) {
    const message = messages[i];
    const processedMessage = processMessage(message);
    if (Array.isArray(processedMessage.content)) {
      const textContent = processedMessage.content.find(c => c.type === 'text');
      if (textContent) {
        formattedMessages.push({
          role: processedMessage.role,
          content: textContent.text,
          metadata: { hasVisionContent: false }
        });
      }
    } else {
      formattedMessages.push(processedMessage);
    }
  }

  // Process the latest message - keep image if present
  if (messages.length > 0) {
    const latestMessage = messages[messages.length - 1];
    const processedMessage = processMessage(latestMessage);
    formattedMessages.push(processedMessage);
    if (Array.isArray(processedMessage.content)) {
      hasVisionContent = processedMessage.content.some(c => c.type === 'image_url');
    }
  }

  // Add new image if provided (this would override any image from the latest message)
  if (imageFile) {
    formattedMessages.push({
      role: 'user',
      content: [
        {
          type: 'text' as const,
          text: latestContent || "What's in this image?"
        },
        {
          type: 'image_url' as const,
          image_url: {
            url: imageFile,
            detail: imageDetail
          }
        }
      ],
      metadata: { hasVisionContent: true }
    });
    hasVisionContent = true;
  }

  return { messages: formattedMessages, hasVisionContent };
} 