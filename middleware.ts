import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Optional: Configure matcher
export const config = {
  matcher: []  // Empty array means middleware won't run on any routes
} 