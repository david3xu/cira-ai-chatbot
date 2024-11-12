import { supabase } from '@/lib/supabase';

interface DocumentInsertParams {
  source: string;
  hash: string;
  index: number;
  content: string;
  fileName: string;
  author: string;
  dominationField: string;
  embedding: number[];
}

export class DocumentStorageService {
  static async insertDocument(params: DocumentInsertParams) {
    const { error } = await supabase
      .from('documents')
      .insert({
        source: params.source,
        source_id: `${params.hash}-${params.index}`,
        content: params.content,
        document_id: `${params.fileName}-part${params.index + 1}`,
        author: params.author,
        domination_field: params.dominationField,
        url: params.fileName,
        embedding: params.embedding,
      });

    if (error) {
      console.error('Document insertion error:', error);
      if (error.code === '42P17') {
        throw new Error('Database policy error - please contact administrator');
      }
      throw error;
    }
  }

  static async checkDocumentExists(fileName: string, dominationField: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('documents')
      .select('url')
      .eq('url', fileName)
      .eq('domination_field', dominationField)
      .limit(1);
    
    if (error) throw error;
    return data !== null && data.length > 0;
  }
} 