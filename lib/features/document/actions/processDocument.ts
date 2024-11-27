export interface ProcessDocumentParams {
  content: string;
  type: 'text' | 'code' | 'markdown';
}

export interface ProcessedDocument {
  content: string;
  sections: DocumentSection[];
  metadata: DocumentMetadata;
  contentType: 'pdf' | 'image' | 'markdown' | string;
}

export interface DocumentSection {
  id: string;
  content: string;
  type: string;
  startLine?: number;
  endLine?: number;
}

export interface DocumentMetadata {
  wordCount: number;
  lineCount: number;
  type: string;
  language?: string;
}

export async function processDocument({
  content,
  type
}: ProcessDocumentParams): Promise<ProcessedDocument> {
  const lines = content.split('\n');
  const sections: DocumentSection[] = [];
  let currentSection: DocumentSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (type === 'code' && (line.startsWith('function') || line.startsWith('class'))) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        id: `section-${sections.length}`,
        content: line,
        type: 'code',
        startLine: i + 1
      };
    } else if (currentSection) {
      currentSection.content += '\n' + line;
      currentSection.endLine = i + 1;
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    content,
    sections,
    metadata: {
      wordCount: content.split(/\s+/).length,
      lineCount: lines.length,
      type
    },
    contentType: 'pdf'
  };
} 