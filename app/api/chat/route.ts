import { fetchChatHistory } from '@/actions/chat';
import { answerQuestion } from '@/actions/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { 
      message, 
      chatId, 
      dominationField, 
      customPrompt, 
      imageFile, 
      documentData, 
      model 
    } = await req.json();
    
    if (!message || !chatId) {
      return NextResponse.json(
        { error: 'Message and chatId are required' },
        { status: 400 }
      );
    }

    // Fetch and validate chat history
    const history = await fetchChatHistory(chatId);
    if (!Array.isArray(history)) {
      return NextResponse.json(
        { error: 'Invalid chat history' },
        { status: 500 }
      );
    }

    // Prepare message with document context
    const messageWithDoc = {
      role: 'user' as const,
      content: message,
      document: documentData
    };
    
    // Set up streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendToken = async (token: string) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
          );
        };

        try {
          await answerQuestion({
            message,
            chatHistory: [...history, messageWithDoc],
            dominationField,
            chatId,
            customPrompt,
            imageBase64: imageFile,
            model,
            onToken: sendToken
          });
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                error: error instanceof Error ? error.message : 'Unknown error' 
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in route handler:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}