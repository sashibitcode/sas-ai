export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string; // base64 data URL
  createdAt: number;
  error?: boolean;
  modelUsed?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
  isDefault?: boolean;
}

export interface ChatRequestPayload {
  messages: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  model?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}
