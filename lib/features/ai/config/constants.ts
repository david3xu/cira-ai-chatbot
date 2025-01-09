/**
 * AI Configuration Constants
 * 
 * Defines core AI configuration parameters:
 * - Token limits
 * - Temperature settings
 * - Retry policies
 * - Domain definitions
 * 
 * Features:
 * - Type-safe domain fields
 * - Helper functions
 * - Default configurations
 * - UI option generation
 */

export const AI_CONSTANTS = {
  MAX_TOKENS: 2000,
  DEFAULT_TEMPERATURE: 0.7,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 5000,
  EMBEDDING_MODEL: 'mxbai-embed-large:latest'
};

export const DEFAULT_PROMPT = "You are a helpful AI assistant. Answer questions accurately and concisely.";

export type DominationField = 
  | 'NORMAL_CHAT'
  | 'PROGRAMMING'
  | 'DATA_MINING'
  | 'DSA'
  | 'EMAIL'
  | 'RUBIN'
  | 'DOCUMENT';

export const DOMINATION_FIELDS: Record<string, DominationField> = {
  NORMAL_CHAT: 'NORMAL_CHAT',
  PROGRAMMING: 'PROGRAMMING',
  DATA_MINING: 'DATA_MINING',
  DSA: 'DSA',
  EMAIL: 'EMAIL',
  RUBIN: 'RUBIN',
  DOCUMENT: 'DOCUMENT'
} as const;

export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

// Helper function to validate domination field
export function isValidDominationField(field: string): field is DominationField {
  return Object.values(DOMINATION_FIELDS).includes(field as DominationField);
}

// UI-friendly version of domination fields with labels
export interface DomainFieldOption {
  value: DominationField;
  label: string;
}

export const getDomainFieldOptions = (): DomainFieldOption[] => [
  { value: 'NORMAL_CHAT', label: 'Normal Chat' },
  { value: 'PROGRAMMING', label: 'Programming' },
  { value: 'DATA_MINING', label: 'Data Mining' },
  { value: 'DSA', label: 'Data Structures & Algorithms' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'RUBIN', label: 'Rubin' },
  { value: 'DOCUMENT', label: 'Document' }
];