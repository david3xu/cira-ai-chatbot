import { NextResponse } from 'next/server';

export function createSuccessResponse(data: any) {
  return NextResponse.json({ data, error: null });
}

export function createErrorResponse(error: string, status = 500) {
  return NextResponse.json({ data: null, error }, { status });
}