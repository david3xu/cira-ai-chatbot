/**
 * Ollama Types
 * 
 * Type definitions for Ollama AI models:
 * - Model details and metadata
 * - Model options for UI
 * - Parameter configurations
 * 
 * Features:
 * - Detailed model information
 * - UI-friendly options
 * - Type safety for model parameters
 * - Family and format specifications
 */

export interface OllamaModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: OllamaModelDetails;
}

export interface ModelOption {
  value: string;
  label: string;
  description?: string;
  details: {
    isOllama: boolean;
    isEmbedding: boolean;
    parameter_size: string;
    family: string;
    families: string[];
    quantization_level: string;
    format: string;
    fullName: string;
  };
} 