import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion } from '@/actions/ai';
import { TextChunkingService } from '@/lib/services/textChunkingService';

export async function POST(req: NextRequest) {
  try {
    const { 
      messages, 
      dominationField, 
      documentInfo,
      chatId,
      onToken = () => {} 
    } = await req.json();

    // Process document content with standard chunking
    const documentChunks = TextChunkingService.getChunks(documentInfo.content, {
      preserveFormatting: true,
      maxChunks: 3 // Limit context size for chat
    });

    const contextContent = documentChunks.join('\n\n');

    const enhancedMessages = messages.map((msg: { role: string; content: string }) => {
      if (msg.role === 'system') {
        return {
          ...msg,
          content: `${msg.content}\n\nDocument Context: ${contextContent}\n\nPlease focus on providing accurate information based on the document content.`
        };
      }
      return msg;
    });

    // Get the last user message from the messages array
    const lastUserMessage = messages.findLast(
      (msg: { role: string; content: string }) => msg.role === 'user'
    )?.content || '';

    const response = await answerQuestion({
      message: lastUserMessage,
      chatHistory: enhancedMessages,
      dominationField,
      chatId,
      customPrompt: `You are analyzing a ${documentInfo.type} file "${documentInfo.fileName}". 
       Please provide accurate information based on the document content.`,
      onToken
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Document Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process document chat' },
      { status: 500 }
    );
  }
} 