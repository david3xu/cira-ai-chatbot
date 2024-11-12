import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion } from '@/actions/ai';
import { fetchChatHistory } from '@/actions/chat';
import { getFullModelName } from '@/lib/modelUtils';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message, chatId, dominationField, customPrompt, imageFile, model } = await req.json();
    
    if (imageFile) {
      if (typeof imageFile === 'string') {
        if (!imageFile.startsWith('data:image/') && !imageFile.startsWith('http')) {
          return NextResponse.json(
            { error: 'Invalid image format. Image must be base64 or URL format.' },
            { status: 400 }
          );
        }
      }
    }
    
    console.log('API route - Received request with:', {
      model,
      fullModelName: getFullModelName(model),
      chatId,
      dominationField
    });
    
    const fieldToUse = dominationField || 'Normal Chat';

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendToken = async (token: string) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
        };

        const history = await fetchChatHistory(chatId);
        
        await answerQuestion({
          message,
          chatHistory: [...history, { role: 'user', content: message }],
          dominationField: fieldToUse,
          chatId,
          customPrompt,
          imageBase64: imageFile,
          model,
          onToken: sendToken
        });

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in route handler:', error);
    let errorMessage = 'An error occurred while processing your request.';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('tsquery stack too small')) {
        errorMessage = 'The search query is too complex. Please try a simpler query.';
        statusCode = 400;
      } else if (error.message.includes('Connection error')) {
        errorMessage = 'Unable to connect to the AI server. Please check your connection and try again.';
        statusCode = 503;
      } else if (error.message.includes('image')) {
        errorMessage = 'Failed to process image. Please try again with a different image.';
        statusCode = 400;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
