import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: settings, error } = await supabase
      .from('model_settings')
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch model settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const settings = await request.json();
    
    const { data, error } = await supabase
      .from('model_settings')
      .upsert(settings)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update model settings' },
      { status: 500 }
    );
  }
} 