import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000';

export async function GET(
  request: NextRequest,
  { params }: { params: { attachmentId: string } }
) {
  try {
    const attachmentId = params.attachmentId;

    if (!attachmentId) {
      return NextResponse.json(
        { error: 'Attachment ID is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user or use default
    let userId = DEFAULT_USER_ID;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (user && !authError) {
      userId = user.id;
    }

    // Get attachment details
    const { data: attachment, error: fetchError } = await supabase
      .from('chat_attachments')
      .select('file_path, file_type, chat_id')
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

    if (chat.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get file from storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from('chat-attachments')
      .download(attachment.file_path);

    if (storageError || !fileData) {
      return NextResponse.json(
        { error: 'Failed to fetch file' },
        { status: 500 }
      );
    }

    // Create response with appropriate content type
    const response = new NextResponse(fileData);
    response.headers.set('Content-Type', attachment.file_type);
    response.headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    return response;

  } catch (error) {
    console.error('Error fetching attachment preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 