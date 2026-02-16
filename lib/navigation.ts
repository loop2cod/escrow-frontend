import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export interface User {
  role?: 'ADMIN' | 'USER';
}

/**
 * Handles navigation for "Get Started" button
 * Redirects based on user authentication status and role
 */
export const handleGetStarted = (router: AppRouterInstance, user?: User | null) => {
  if (user) {
    // Redirect based on role
    if (user.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  } else {
    router.push('/login');
  }
};
