export class FileProcessingService {
  static async processFile(file: File): Promise<string> {
    const text = await file.text();
    return this.cleanText(text);
  }

  private static cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, '    ')
      .replace(/[^\S\n]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
} 