export interface OllamaModel {
  id: string;
  name: string;
  details?: {
    parameter_size?: string;
    quantization_level?: string;
    [key: string]: any;
  };
}

export interface OllamaResponse {
  models: OllamaModel[];
} 