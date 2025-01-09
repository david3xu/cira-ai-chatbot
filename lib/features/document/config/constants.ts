export const STORAGE_CONFIG = {
  BUCKET_NAME: 'documents',
  MAX_FILE_SIZE: 52428800, // 50MB
} as const;

export const DOCUMENT_DEFAULTS = {
  AUTHOR: 'default',
  SOURCE: 'default',
  DOMINATION_FIELD: 'NORMAL_CHAT'
} as const;

export const LARGE_FILE_THRESHOLD = 100 * 1024; // 100KB 