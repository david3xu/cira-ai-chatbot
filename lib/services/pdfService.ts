import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfConversionOptions {
  preserveFormatting?: boolean;
  debug?: boolean;
}

export class PdfService {
  static async convertToText(
    file: File, 
    options: PdfConversionOptions = {}
  ): Promise<string> {
    const { debug = false } = options;

    try {
      if (debug) console.log('Starting PDF conversion with PDF.js');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      if (debug) console.log(`PDF loaded: ${pdf.numPages} pages`);
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        if (debug) console.log(`Processing page ${i}`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n\n';
      }

      if (text.trim().length === 0) {
        console.warn('Warning: Extracted text is empty');
        return '';
      }

      if (debug) {
        console.log('Conversion completed');
        console.log(`Total length: ${text.length} characters`);
      }

      return text;
    } catch (error) {
      console.error('Error converting PDF:', error);
      throw new Error(error instanceof Error ? error.message : 'PDF conversion failed');
    }
  }

  static async convertToMarkdown(file: File): Promise<string> {
    const text = await this.convertToText(file, { preserveFormatting: true });
    return text;
  }
} 