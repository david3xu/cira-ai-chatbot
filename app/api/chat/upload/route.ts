import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const chatId = formData.get('chatId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('chat-files')
      .upload(`${chatId}/${file.name}`, file);

    if (uploadError) throw uploadError;

    // Create file record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert([{
        chat_id: chatId,
        name: file.name,
        size: file.size,
        type: file.type,
        path: uploadData.path
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json(fileRecord);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 