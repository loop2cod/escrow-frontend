'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                await apiClient.post('/auth/verify-email', { token });
                setStatus('success');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may be expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md p-8 text-center space-y-6">
                <div className="flex justify-center">
                    {status === 'loading' && (
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    )}
                    {status === 'success' && (
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    {status === 'loading' && (
                        <h1 className="text-2xl font-bold">Verifying...</h1>
                    )}
                    {status === 'success' && (
                        <>
                            <h1 className="text-2xl font-bold">Email Verified!</h1>
                            <p className="text-muted-foreground">
                                Your email has been successfully verified. You can now access all features.
                            </p>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <h1 className="text-2xl font-bold">Verification Failed</h1>
                            <p className="text-muted-foreground">{message}</p>
                        </>
                    )}
                </div>

                <div className="pt-4">
                    <Button
                        className="w-full"
                        onClick={() => router.push(status === 'success' ? '/dashboard' : '/login')}
                    >
                        {status === 'success' ? 'Go to Dashboard' : 'Back to Login'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
