import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ChatAttachmentService } from '@/lib/services/ChatAttachmentService';
import { ChatError, ErrorCodes } from '@/lib/types/errors';

const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Starting file upload process');
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const chatId = formData.get('chatId') as string;
    const messageId = formData.get('messageId') as string;

    console.log('📋 Received upload request:', {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      chatId,
      messageId
    });

    // Validate required fields
    if (!file) {
      console.error('Missing file in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!chatId) {
      console.error('Missing chatId in request');
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    if (!messageId) {
      console.error('Missing messageId in request');
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verify chat exists
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .single();

    if (chatError || !chat) {
      console.error('Chat verification failed:', chatError);
      return NextResponse.json(
        { error: 'Invalid chat ID' },
        { status: 400 }
      );
    }

    console.log('🔍 Verified chat exists:', { chatId });

    // Upload attachment
    const attachment = await ChatAttachmentService.uploadAttachment(
      file,
      chatId,
      messageId,
      DEFAULT_USER_ID,
      formData,
      undefined // onProgress not needed for API route
    );

    console.log('✅ Attachment uploaded successfully:', {
      attachmentId: attachment.id,
      fileName: attachment.fileName,
      chatId,
      messageId
    });

    return NextResponse.json({ data: attachment });

  } catch (error) {
    console.error('❌ Error handling attachment:', error);

    if (error instanceof ChatError) {
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code, 
          metadata: error.metadata 
        },
        { status: error.code === ErrorCodes.VALIDATION_ERROR ? 400 : 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to upload attachment', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get('id');

    if (!attachmentId) {
      return NextResponse.json(
        { error: 'Attachment ID is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get attachment details
    const { data: attachment, error: fetchError } = await supabase
      .from('chat_attachments')
      .select('chat_id')
      .eq('id', attachmentId)
      .single();

    if (fetchError || !attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      );
    }

    // Verify chat ownership
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('user_id')
      .eq('id', attachment.chat_id)
      .single();

    if (chatError || !chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    if (chat.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete attachment
    await ChatAttachmentService.deleteAttachment(attachmentId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting attachment:', error);

    if (error instanceof ChatError) {
      return NextResponse.json(
        { error: error.message, code: error.code, metadata: error.metadata },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 