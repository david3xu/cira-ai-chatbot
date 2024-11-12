interface DocumentContent {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
  };
}

export async function processDocument(file: File): Promise<DocumentContent> {
  if (file.type === 'application/pdf') {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/convertPdf', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to convert PDF: ${response.statusText}`);
    }
    
    const text = await response.text();
    return {
      text,
      metadata: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      }
    };
  } else if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
    const text = await file.text();
    return {
      text,
      metadata: {
        fileName: file.name,
        fileType: 'text/markdown',
        fileSize: file.size
      }
    };
  } else {
    // Handle other text-based files
    const text = await file.text();
    return {
      text,
      metadata: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      }
    };
  }
} 