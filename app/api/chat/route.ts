import { NextRequest } from 'next/server';
import { createErrorResponse } from '@/lib/utils/apiUtils';
import { z } from 'zod';
import { ChatStorageManager } from '@/lib/features/chat/utils/ChatStorageManager';
import { ErrorHandler } from '@/lib/utils/error';

export const runtime = 'edge';

// Schema for different chat operations
const chatSchemas = {
  create: z.object({
    model: z.string().optional(),
    domination_field: z.string().optional(),
    name: z.string().optional(),
    custom_prompt: z.string().nullable().optional(),
    metadata: z.record(z.any()).optional(),
    source: z.string()
  }),
  update: z.object({
    chat_id: z.string().uuid('Invalid chat ID'),
    updates: z.object({
      name: z.string().optional(),
      model: z.string().optional(),
      custom_prompt: z.string().nullable().optional(),
      domination_field: z.string().optional(),
      metadata: z.record(z.any()).optional()
    })
  })
};

const validateRequest = async (req: NextRequest, schema: z.ZodSchema) => {
  try {
    const body = await req.json();
    return await schema.parseAsync(body);
  } catch (error) {
    console.error('Request validation error:', error);
    throw error;
  }
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    return `Validation error: ${error.errors[0].message}`;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

export async function POST(req: NextRequest) {
  console.log('Received chat creation request:', req.url);
  
  try {
    const validatedData = await validateRequest(req, chatSchemas.create);
    
    const chatId = crypto.randomUUID();
    const chat = {
      id: chatId,
      model: validatedData.model || 'null',
      dominationField: validatedData.domination_field || 'Normal Chat',
      name: validatedData.name || 'New Chat',
      customPrompt: validatedData.custom_prompt || null,
      metadata: {
        ...validatedData.metadata,
        source: validatedData.source
      },
      userId: '',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ChatStorageManager.executeTransaction(async () => {
      await ChatStorageManager.updateChat(chat);
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: { chat } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chat creation error:', error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}

export async function PATCH(req: NextRequest) {
  console.log('Received chat update request:', req.url);
  
  try {
    const validatedData = await validateRequest(req, chatSchemas.update);
    
    const chat = await ChatStorageManager.executeWithTransaction(
      validatedData.chat_id,
      async () => {
        const existingChat = await ChatStorageManager.getChat(validatedData.chat_id);
        if (!existingChat) {
          throw new Error('Chat not found');
        }

        const updatedChat = {
          ...existingChat,
          ...validatedData.updates,
          updatedAt: new Date().toISOString()
        };

        await ChatStorageManager.updateChat(updatedChat);
        return updatedChat;
      }
    );

    return new Response(JSON.stringify({ 
      success: true, 
      data: { chat } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chat update error:', error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const chatId = url.searchParams.get('chat_id');

    if (!chatId) {
      return createErrorResponse('Chat ID is required', 400);
    }

    const chat = await ChatStorageManager.executeTransaction(async () => {
      const result = await ChatStorageManager.getChat(chatId);
      return result;
    });

    if (!chat) {
      return createErrorResponse('Chat not found', 404);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: { chat } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chat fetch error:', error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const chatId = url.searchParams.get('chat_id');

    if (!chatId) {
      return createErrorResponse('Chat ID is required', 400);
    }

    await ChatStorageManager.executeTransaction(async () => {
      await ChatStorageManager.deleteChat(chatId);
      return;
    });

    return new Response(JSON.stringify({ 
      success: true 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chat deletion error:', error);
    return createErrorResponse(getErrorMessage(error), 500);
  }
}