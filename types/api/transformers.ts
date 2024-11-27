type CaseTransformer = (str: string) => string;

const toSnakeCase: CaseTransformer = (str) =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const toCamelCase: CaseTransformer = (str) =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const transformValue = (value: any, transformer: CaseTransformer): any => {
  if (Array.isArray(value)) {
    return value.map(item => transformValue(item, transformer));
  }
  
  if (value && typeof value === 'object' && value.constructor === Object) {
    return transformKeys(value, transformer);
  }
  
  return value;
};

const transformKeys = <T extends Record<string, any>>(
  obj: T | null | undefined, 
  transformer: CaseTransformer
): Record<string, any> => {
  if (!obj) {
    return {};  // Return empty object if input is null/undefined
  }
  
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const transformedKey = transformer(key);
    acc[transformedKey] = transformValue(value, transformer);
    return acc;
  }, {} as Record<string, any>);
};

export const toApiCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toApiCase);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    acc[snakeKey] = toApiCase(obj[key]);
    return acc;
  }, {} as any);
};

export const fromApiCase = <T extends Record<string, any>>(data: T): Record<string, any> => {
  return transformKeys(data, toCamelCase);
};

// Type guard to check if value is a plain object
export const isPlainObject = (value: unknown): value is Record<string, any> => {
  return value !== null && 
         typeof value === 'object' && 
         value.constructor === Object;
};
