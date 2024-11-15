const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const validateImage = (file: File) => {
  if (!file) throw new Error('No file selected');
  
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Unsupported file type: ${file.type}. Supported types: ${SUPPORTED_IMAGE_TYPES.join(', ')}`
    );
  }
  
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 5MB`
    );
  }
};

export const encodeImageToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Validate base64 format
      if (!base64String.startsWith('data:image/')) {
        reject(new Error('Invalid image encoding'));
      }
      resolve(base64String);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const compressImage = async (base64: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate new dimensions (max 1024px)
      let width = img.width;
      let height = img.height;
      const maxDimension = 1024;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Compress with quality 0.8
      const compressed = canvas.toDataURL('image/jpeg', 0.8);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}; 