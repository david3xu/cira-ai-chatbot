import OpenAI from 'openai';
import { retryWithBackoff } from '../utils/retry';
import { openai } from '../config/openai';
import { FormattedMessage, MessageContent } from '@/lib/types/chat';

/**
 * Completion Service
 * 
 * Handles AI completions with:
 * - Streaming support
 * - Error handling
 * - Retry logic
 * - Token management
 * - Vision support
 * 
 * Features:
 * - Stream processing
 * - Error recovery
 * - Temperature control
 * - Token limiting
 * - Response formatting
 * - Image understanding
 */

function formatMessage(message: FormattedMessage): any {
  console.log('🔄 Formatting message:', {
    role: message.role,
    contentType: Array.isArray(message.content) ? 'array' : typeof message.content,
    rawContent: message.content
  });

  // If content is already an array of MessageContent (vision format)
  if (Array.isArray(message.content)) {
    console.log('📦 Processing array content:', message.content.map(c => ({ type: c.type })));
    
    const formattedContent = message.content.map((c: MessageContent) => {
      if (c.type === 'text') {
        return { type: 'text', text: c.text };
      }
      if (c.type === 'image_url') {
        // Ensure image_url is properly formatted
        const imageUrl = typeof c.image_url === 'string' ? c.image_url : c.image_url?.url;
        if (!imageUrl) {
          console.warn('⚠️ Invalid image URL format');
          return null;
        }
        // Validate URL format
        try {
          new URL(imageUrl);
        } catch (e) {
          console.warn('⚠️ Invalid URL format');
          return null;
        }
        // Ensure URL is accessible (starts with http/https/data)
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
          console.warn('⚠️ URL must start with http://, https://, or data:');
          return null;
        }
        return {
          type: 'image_url' as const,
          image_url: {
            url: imageUrl,
            detail: c.image_url.detail || 'auto'
          }
        };
      }
      return null;
    }).filter((c): c is NonNullable<typeof c> => c !== null);

    if (formattedContent.length === 0) {
      const textContent = message.content.find((c): c is { type: 'text', text: string } => c.type === 'text');
      console.warn('⚠️ No valid content after formatting, falling back to text');
      return {
        role: message.role,
        content: textContent?.text || ''
      };
    }

    console.log('✅ Formatted content:', {
      role: message.role,
      contentTypes: formattedContent.map(c => ({ type: c.type })),
      contentCount: formattedContent.length
    });

    return {
      role: message.role,
      content: formattedContent
    };
  }

  // Default to text content
  return {
    role: message.role,
    content: message.content as string
  };
}

export async function createCompletion(
  messages: FormattedMessage[],
  model: string,
  onToken?: (token: string) => void,
  hasVisionContent?: boolean
): Promise<string> {
  console.log('🔍 [createCompletion] Starting with model:', {
    model,
    messageCount: messages.length,
    streaming: !!onToken,
    hasVisionContent
  });

  return retryWithBackoff(async () => {
    try {
      // Format messages to handle both text and vision content
      const formattedMessages = messages.map((msg, index) => {
        const formatted = formatMessage(msg);
        const hasVision = Array.isArray(formatted.content) && formatted.content.some((c: MessageContent) => c.type === 'image_url');
        
        // Log message info without base64 data
        console.log(`📝 Message ${index}:`, {
          role: formatted.role,
          contentType: Array.isArray(formatted.content) ? 'array' : typeof formatted.content,
          hasVision,
          contentSummary: Array.isArray(formatted.content) 
            ? formatted.content.map((c: MessageContent) => ({ type: c.type }))
            : 'text'
        });
        return formatted;
      });

      // Validate vision content if expected
      if (hasVisionContent) {
        const visionMessages = formattedMessages.filter(msg => 
          Array.isArray(msg.content) && msg.content.some((c: MessageContent) => c.type === 'image_url')
        );
        
        console.log('🔍 Vision content check:', {
          expectedVision: hasVisionContent,
          foundVisionMessages: visionMessages.length,
          totalMessages: formattedMessages.length,
          visionMessageIndexes: formattedMessages.map((msg, i) => 
            Array.isArray(msg.content) && msg.content.some((c: MessageContent) => c.type === 'image_url') ? i : null
          ).filter(i => i !== null)
        });
        
        if (visionMessages.length === 0) {
          throw new Error('Expected vision content but none was found in formatted messages');
        }
      }

      const apiOptions = {
        model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2000,
        ...(onToken && { stream: true })
      };

      if (onToken) {
        console.log('🔍 [createCompletion] Creating streaming completion:', { model, hasVisionContent });
        const stream = await openai.chat.completions.create(apiOptions);
        
        let fullResponse = '';
        for await (const chunk of stream as any) {
          const content = chunk.choices?.[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            onToken(content);
          }
        }
        return fullResponse;
      } else {
        console.log('🔍 [createCompletion] Creating non-streaming completion:', { model, hasVisionContent });
        const completion = await openai.chat.completions.create(apiOptions);
        if ('choices' in completion) {
          return completion.choices[0]?.message?.content || '';
        }
        return '';
      }
    } catch (error) {
      console.error('🔍 [createCompletion] Error:', {
        model,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Enhance error message for vision content issues
      if (hasVisionContent && error instanceof Error) {
        if (error.message.includes('invalid message content')) {
          throw new Error(`Vision content error: ${error.message}. Please ensure images are properly formatted and accessible.`);
        }
        if (error.message.includes('Expected vision content')) {
          throw new Error(`Vision content missing: ${error.message}. Please check if the image was properly attached and formatted.`);
        }
      }
      
      if (error instanceof OpenAI.APIError) {
        throw new Error(`API error: ${error.message}`);
      }
      throw error;
    }
  });
} 