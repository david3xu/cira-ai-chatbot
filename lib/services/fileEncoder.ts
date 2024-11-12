export class FileEncoder {
  /**
   * Converts a File or Blob to base64 string, handling both client and server environments
   */
  static async toBase64(file: File | Blob): Promise<string> {
    if (typeof window === 'undefined') {
      const buffer = await file.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } else {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }
  }

  /**
   * Converts a File to ArrayBuffer
   */
  static async toArrayBuffer(file: File): Promise<ArrayBuffer> {
    return await file.arrayBuffer();
  }

  /**
   * Checks if a file is of valid type
   */
  static isValidType(file: File): boolean {
    const validTypes = [
      'image/',
      'text/markdown',
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    return validTypes.some(type => file.type.startsWith(type));
  }

  /**
   * Gets file extension from filename
   */
  static getExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  }

  /**
   * Checks if file is a PDF
   */
  static isPdf(file: File): boolean {
    if (!file) return false;
    
    // Check MIME type first
    if (file.type === 'application/pdf') return true;
    
    // Then check file extension
    const filename = file.name || '';
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return extension === 'pdf';
  }
} 