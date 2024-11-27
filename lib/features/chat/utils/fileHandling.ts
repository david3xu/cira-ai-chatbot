export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const isValidFileType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/markdown'];
  return validTypes.includes(file.type);
};

export const isValidFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
} 