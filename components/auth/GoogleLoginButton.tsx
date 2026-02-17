'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from '@/hooks/use-toast';

export function GoogleLoginButton() {
    const router = useRouter();
    const { loginWithGoogle } = useAuthStore();

    const handleSuccess = async (credentialResponse: any) => {
        try {
            if (credentialResponse.credential) {
                await loginWithGoogle(credentialResponse.credential);
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Google login failed', error);
            toast({
                title: 'Login Failed',
                description: 'Could not sign in with Google. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleError = () => {
        console.error('Google Login Error');
        toast({
            title: 'Login Error',
            description: 'Google sign in was unsuccessful.',
            variant: 'destructive',
        });
    };

    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="outline"
                width="350px" // Approximate width to match other buttons if possible, or use container width
            />
        </div>
    );
}
