import { apiClient } from './apiClient';
import type { ChatRequest, ChatResponse } from '../types/chat';

export const chatService = {
  sendMessage: (message: string, history?: { role: string; content: string }[]): Promise<ChatResponse> =>
    apiClient<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history } as ChatRequest),
    }),
};
