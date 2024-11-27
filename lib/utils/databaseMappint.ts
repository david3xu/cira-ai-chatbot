export const toDatabaseFormat = (obj: Record<string, any>) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = value;
    return acc;
  }, {} as Record<string, any>);
};

export const fromDatabaseFormat = (obj: Record<string, any>) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = value;
    return acc;
  }, {} as Record<string, any>);
};
