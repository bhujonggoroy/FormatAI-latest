export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'local';

export interface AIGenerateRequest {
  prompt: string;
  system_instruction?: string;
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  max_output_tokens?: number;
}

export interface AIGenerateResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  finish_reason?: string;
}

export interface AIErrorDetail {
  code: string;
  message: string;
}

export interface AIErrorResponse {
  success: boolean;
  error: AIErrorDetail;
}

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: string;
  recommendedTask: string;
}
