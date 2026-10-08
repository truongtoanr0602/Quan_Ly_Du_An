export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: RecommendedProduct[];
  isLoading?: boolean;
}

export interface RecommendedProduct {
  productId: number;
  productName: string;
  price: number;
  imageUrl?: string;
  reason?: string;
}

export interface ChatRequest {
  message: string;
  history?: { role: string; content: string }[];
}

export interface ChatResponse {
  reply: string;
  products?: RecommendedProduct[];
}
