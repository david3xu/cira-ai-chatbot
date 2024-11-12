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
