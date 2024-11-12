import { FileEncoder } from '@/lib/services/fileEncoder';

// Export all methods from FileEncoder for backward compatibility
export const encodeImageToBase64 = FileEncoder.toBase64;
export const convertBlobToBase64 = FileEncoder.toBase64;
export const getFileExtension = FileEncoder.getExtension;
export const isPdfFile = FileEncoder.isPdf;
export const encodeImage = FileEncoder.toArrayBuffer;
export const isValidFile = FileEncoder.isValidType;

export const compressImage = async (base64Image: string): Promise<string> => {
  const img = new Image();
  img.src = base64Image;
  
  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Set max dimensions while maintaining aspect ratio
      const maxDim = 1024;
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > maxDim) {
        height = (height * maxDim) / width;
        width = maxDim;
      } else if (height > maxDim) {
        width = (width * maxDim) / height;
        height = maxDim;
      }

      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};
