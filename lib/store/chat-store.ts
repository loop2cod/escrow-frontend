import { create } from 'zustand';
import { ChatState, Message } from '@/lib/types';
import apiClient from '@/lib/api-client';

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  unreadCount: 0,
  typingUsers: [],

  fetchMessages: async (contractId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/chat/${contractId}/messages`);
      set({ 
        messages: response.data.data.messages,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch messages',
        isLoading: false 
      });
    }
  },

  sendMessage: async (contractId: string, content: string) => {
    set({ isSending: true, error: null });
    try {
      const response = await apiClient.post(`/chat/${contractId}/messages`, {
        content,
        type: 'TEXT'
      });
      
      // Don't add to state here - socket will handle it
      set({ isSending: false });
      
      return response.data.data.message;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to send message',
        isSending: false 
      });
      throw error;
    }
  },

  markAsRead: async (contractId: string) => {
    try {
      await apiClient.patch(`/chat/${contractId}/read`);
      set({ unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  fetchUnreadCount: async (contractId: string) => {
    try {
      const response = await apiClient.get(`/chat/${contractId}/unread`);
      set({ unreadCount: response.data.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  addMessage: (message: Message) => {
    set(state => {
      // Check for duplicates by ID
      const exists = state.messages.some(msg => msg.id === message.id);
      if (exists) {
        return state; // Don't add duplicate
      }
      return {
        messages: [...state.messages, message]
      };
    });
  },

  updateMessageStatus: (messageId: string, status: 'SENT' | 'DELIVERED' | 'READ') => {
    set(state => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      )
    }));
  },

  setTyping: (contractId: string, isTyping: boolean) => {
    // This is handled via socket, but we can add local state if needed
  },

  clearError: () => set({ error: null }),
}));
