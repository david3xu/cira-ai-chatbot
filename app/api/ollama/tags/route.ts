// import { NextRequest } from 'next/server';
// import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
// import { OllamaModel } from '@/types/ollama';

// export async function GET() {
//   try {
//     const response = await fetch('http://localhost:11434/api/tags');
//     if (!response.ok) throw new Error('Failed to fetch models');
//     const data = await response.json();
//     console.log('API Response:', data);
//     return createSuccessResponse({ models: data.models as OllamaModel[] });
//   } catch (error) {
//     console.error('API Error:', error);
//     return createErrorResponse(
//       error instanceof Error ? error.message : 'Failed to fetch models'
//     );
//   }
// } 