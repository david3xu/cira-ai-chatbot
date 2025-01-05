import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://localhost:11434/v1/models', {
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 60 // Cache for 60 seconds
      }
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('Error in /api/ai/models:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'An error occurred',
      { status: 500 }
    )
  }
}
