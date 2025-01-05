export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export interface AICompletionOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
}