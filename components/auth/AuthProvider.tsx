'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      loadUser();
    }
  }, []);

  return <>{children}</>;
}
