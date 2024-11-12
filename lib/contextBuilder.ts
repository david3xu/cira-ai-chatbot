import { searchSimilarDocuments } from './vectorSearch';

export async function buildContext(
  query: string,
  dominationField: string
): Promise<string> {
  // Get relevant documents
  const documents = await searchSimilarDocuments(query, dominationField);
  
  if (!documents || documents.length === 0) {
    return '';
  }

  // Build context string from relevant documents
  const context = documents
    .map((doc: {content: string}) => `${doc.content}\n---\n`)
    .join('\n');

  return context;
}