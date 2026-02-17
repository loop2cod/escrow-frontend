'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DoorOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn
} from 'lucide-react';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData);
      const user = useAuthStore.getState().user;

      // Redirect based on role
      if (user?.role === UserRole.ADMIN) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      // Error is already set in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-4 sm:py-8 px-4">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}>
      </div>

      {/* Radial Gradient Overlay for Vignette Effect */}
      <div className="absolute inset-0 z-0 bg-background/80 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)] pointer-events-none"></div>

      <Card className="w-full max-w-[400px] p-6 sm:p-8 z-10 border-border/50 bg-card/95 backdrop-blur shadow-2xl">
        <div className="flex flex-col items-center mb-6 sm:mb-8 text-center space-y-3 sm:space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Please sign in to continue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-md animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="pl-10 h-10 bg-secondary/30 border-border/50 focus:bg-background transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="pl-10 pr-10 h-10 bg-secondary/30 border-border/50 focus:bg-background transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" className="h-4 w-4 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
            {/* <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground hover:underline transition-colors font-medium"
            >
              Forgot your password?
            </Link> */}
          </div>

          <Button
            type="submit"
            className="w-full h-10 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              'Signing in...'
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleLoginButton />

          <p className="text-center text-sm text-muted-foreground pt-2 sm:pt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
