import { create } from 'zustand';
import Cookies from 'js-cookie';
import apiClient from '@/lib/api-client';
import {
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ApiError,
} from '@/lib/types';
import { AxiosError } from 'axios';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login function
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials
      );

      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens in cookies
      Cookies.set('accessToken', accessToken, {
        expires: 1 / 48, // 30 minutes
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      Cookies.set('refreshToken', refreshToken, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      // Also set legacy 'token' cookie for middleware compatibility
      Cookies.set('token', accessToken, {
        expires: 1 / 48,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorMessage =
        axiosError.response?.data?.message || 'Login failed. Please try again.';

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  // Register function
  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        data
      );

      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens in cookies
      Cookies.set('accessToken', accessToken, {
        expires: 1 / 48, // 30 minutes
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      Cookies.set('refreshToken', refreshToken, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      // Also set legacy 'token' cookie for middleware compatibility
      Cookies.set('token', accessToken, {
        expires: 1 / 48,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorMessage =
        axiosError.response?.data?.message ||
        'Registration failed. Please try again.';

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  // Logout function
  logout: async () => {
    set({ isLoading: true });

    try {
      // Call logout endpoint to invalidate refresh token
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user state regardless of API call result
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('token');

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // Load user from token
  loadUser: async () => {
    const accessToken = Cookies.get('accessToken');

    if (!accessToken) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true });

    try {
      const response = await apiClient.get<{
        status: boolean;
        message: string;
        data: { user: User };
      }>('/auth/me');

      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Load user error:', error);

      // Clear invalid tokens
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('token');

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set user manually (useful for updates)
  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },
}));
