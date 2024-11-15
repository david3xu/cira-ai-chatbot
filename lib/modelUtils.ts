export const DEFAULT_MODEL = process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'llama3.2-vision:latest';

export const formatModelName = (modelValue: string) => {
  return modelValue || DEFAULT_MODEL;
};

export const getFullModelName = (modelValue: string) => {
  if (!modelValue) return DEFAULT_MODEL;
  return modelValue;
};

export const getCurrentModel = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedModel') || DEFAULT_MODEL;
  }
  return DEFAULT_MODEL;
};

export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
} 