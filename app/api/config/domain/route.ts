import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    const { field, scoring } = await req.json();
    
    const { data, error } = await supabase.rpc('update_scoring_config', {
      p_domain_field: field,
      p_similarity_weight: scoring?.similarityWeight,
      p_recency_weight: scoring?.recencyWeight,
      p_popularity_weight: scoring?.popularityWeight
    });

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update domain config' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const field = req.url.split('/').pop();
  if (!field) {
    return NextResponse.json({ error: 'Domain field is required' }, { status: 400 });
  }
  
  try {
    const { data, error } = await supabase
      .from('scoring_config')
      .select('*')
      .eq('domain_field', field)
      .single();

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get domain config' },
      { status: 500 }
    );
  }
} 