import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withValidation } from '@/lib/middleware/validation';
import { createSuccessResponse } from '@/lib/utils/apiUtils';
import { answerQuestion } from '@/lib/features/ai/actions';
import { TextChunkingService } from '@/lib/services/document/processing/TextChunkingService';
import { DocumentChatRequest } from '@/lib/types/api';
import { fromApiCase } from '@/types/api/transformers';   

const documentChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'system', 'assistant']),
    content: z.string()
  })).min(1, 'At least one message is required'),
  dominationField: z.string().min(1, 'Domination field is required'),
  documentInfo: z.object({
    content: z.string().min(1, 'Document content is required'),
    type: z.string().min(1, 'Document type is required'),
    fileName: z.string().min(1, 'File name is required')
  }),
  chatId: z.string().uuid('Invalid chat ID format'),
  model: z.string().min(1, 'Model is required'),
  metadata: z.record(z.any()).optional()
});

export const POST = withValidation<DocumentChatRequest>(
  documentChatSchema,
  async (data) => {
    const documentChunks = TextChunkingService.chunkText(data.documentInfo.content, {
      maxChunkSize: 1000,
      overlap: 200
    });

    const contextContent = documentChunks.join('\n\n');
    const enhancedMessages = data.messages.map(msg => 
      msg.role === 'system' 
        ? {
            ...msg,
            content: `${msg.content}\n\nDocument Context: ${contextContent}\n\nPlease focus on providing accurate information based on the document content.`
          }
        : msg
    );

    const lastUserMessage = data.messages.findLast(msg => msg.role === 'user')?.content || '';

    const response = await answerQuestion({
      message: lastUserMessage,
      chatHistory: enhancedMessages,
      dominationField: data.dominationField,
      chatId: data.chatId,
      customPrompt: `You are analyzing a ${data.documentInfo.type} file "${data.documentInfo.fileName}". Please provide accurate information based on the document content.`
    });

    return createSuccessResponse({ response: fromApiCase(response) });
  }
); 