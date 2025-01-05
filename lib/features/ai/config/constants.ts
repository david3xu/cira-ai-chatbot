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

// Combined domination fields definition
export const DOMINATION_FIELDS = {
  RUBIN: 'Rubin Observation',
  NORMAL_CHAT: 'General',
  PROGRAMMING: 'Programming Languages',
  DATA_MINING: 'Data Mining',
  DSA: 'Data Structures and Algorithms',
  EMAIL: 'Email',
  CYBERSECURITY: 'Cybersecurity',
  NETWORKING: 'Networking',
  CLOUD: 'Cloud',
  DEVOPS: 'DevOps'
} as const;

export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

// Type for domination fields
export type DominationField = typeof DOMINATION_FIELDS[keyof typeof DOMINATION_FIELDS];

// Helper function to validate domination field
export function isValidDominationField(field: string): field is DominationField {
  return Object.values(DOMINATION_FIELDS).includes(field as DominationField);
}

// Helper function to get domination field options for UI
export const getDominationFieldOptions = () => 
  Object.values(DOMINATION_FIELDS).map(value => ({
    value,
    label: value
  }));