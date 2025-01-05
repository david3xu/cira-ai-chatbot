export interface ModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
  description: string;
  parameters: string;
}

export interface Model {
  id: string;
  name: string;
  model: string;
  provider: string;
  modified_at: string;
  size: number;
  digest: string;
  details: ModelDetails;
  capabilities: string[];
  metadata?: Record<string, any>;
  config?: ModelConfig;
}

export interface ModelConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  streamResponses?: boolean;
  showTimestamps?: boolean;
}

// Re-export for backward compatibility
export type OllamaModel = Model;