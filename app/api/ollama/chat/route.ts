import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withValidation } from '@/lib/middleware/validation';
import { createStreamResponse, createErrorResponse } from '@/lib/utils/apiUtils';

export const runtime = 'edge';

const ollamaChatSchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string()
  })),
  model: z.string().optional(),
  stream: z.boolean().optional()
});

export const POST = withValidation(ollamaChatSchema, async (validatedData) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedData)
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const reader = response.body?.getReader();
  if (reader) {
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            await writer.close();
            break;
          }
          await writer.write(value);
        }
      } catch (error) {
        console.error('Error streaming response:', error);
        await writer.abort(error);
      }
    })();
  }

  return createStreamResponse(readable);
});
