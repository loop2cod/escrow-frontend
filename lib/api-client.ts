import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = Cookies.get('accessToken');

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refreshToken');

      if (!refreshToken) {
        // No refresh token, logout user
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('token'); // Remove legacy token if exists

        const publicRoutes = ['/login', '/register', '/verify-email', '/privacy-policy', '/terms-of-service', '/cookie-policy', '/'];
        const isPublicRoute = publicRoutes.some(route => {
          if (route === '/') return window.location.pathname === '/';
          return window.location.pathname.startsWith(route);
        });

        if (!isPublicRoute) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;

        // Save new access token
        Cookies.set('accessToken', accessToken, {
          expires: 1 / 48, // 30 minutes
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        // Update legacy token for middleware compatibility
        Cookies.set('token', accessToken, {
          expires: 1 / 48,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        isRefreshing = false;

        // Refresh failed, logout user
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('token');

        const publicRoutes = ['/login', '/register', '/verify-email', '/privacy-policy', '/terms-of-service', '/cookie-policy', '/'];
        const isPublicRoute = publicRoutes.some(route => {
          if (route === '/') return window.location.pathname === '/';
          return window.location.pathname.startsWith(route);
        });

        if (!isPublicRoute) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
