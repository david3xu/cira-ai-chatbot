import { supabase } from '@/lib/supabase';

export async function uploadImage(file: File | string): Promise<string> {
  // If the input is already a base64 string or URL, return it directly
  if (typeof file === 'string') {
    if (file.startsWith('data:image/') || file.startsWith('http')) {
      return file;
    }
  }

  // For File objects, convert to base64
  if (file instanceof File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  throw new Error('Invalid image format');
}
