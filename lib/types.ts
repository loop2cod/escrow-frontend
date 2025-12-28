// User roles enum
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Auth API request types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Auth API response types
export interface AuthResponse {
  status: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  status: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface ApiError {
  status: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Auth store state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}
