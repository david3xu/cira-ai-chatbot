export const AI_CONSTANTS = {
  MAX_TOKENS: 2000,
  DEFAULT_TEMPERATURE: 0.7,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 5000,
  EMBEDDING_MODEL: 'mxbai-embed-large:latest',
  DEFAULT_MODEL: 'llama3.1',
  FALLBACK_MODEL: 'llama3.1'
};

export const DOMINATION_FIELDS = {
  NORMAL_CHAT: 'Normal Chat',
  EMAIL: 'Email',
  DOCUMENT: 'Document',
  RUBIN: 'Rubin Observation'
} as const; 