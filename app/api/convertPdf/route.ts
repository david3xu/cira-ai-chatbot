import { NextRequest, NextResponse } from 'next/server';
import { convertPdfToText } from '@/lib/features/ai/actions/convertPdfToText';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await convertPdfToText(file);

    return new NextResponse(text, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('Error converting PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PDF conversion failed' },
      { status: 500 }
    );
  }
}