'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api-client';
import { Wallet, ArrowLeft, RefreshCw, DollarSign, PlusCircle } from 'lucide-react';

interface UserDetail {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
    userReferenceId?: string;
    createdAt: string;
    wallets: {
        id: string;
        network: 'TRON' | 'ETHEREUM' | 'SOLANA' | 'BITCOIN';
        address: string;
        currency: string;
        balance: string;
        status: string;
    }[];
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { id } = use(params);

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            else setIsRefreshing(true);

            const response = await apiClient.get(`/admin/users/${id}`);
            setUser(response.data.data.user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch user details');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleStatusChange = async (newStatus: 'ACTIVE' | 'SUSPENDED' | 'DISABLED') => {
        if (!confirm(`Change status to ${newStatus}?`)) return;
        try {
            setIsActionLoading(true);
            await apiClient.patch(`/admin/users/${id}/status`, { status: newStatus });
            fetchUserDetails(false);
        } catch (err: any) {
            alert(`Failed: ${err.message}`);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCreateWallet = async (network: string) => {
        if (!confirm(`Create ${network} wallet?`)) return;
        try {
            setIsActionLoading(true);
            await apiClient.post(`/admin/users/${id}/wallets`, { network });
            fetchUserDetails(false);
        } catch (err: any) {
            alert(`Failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Calculate Total Net Asset Value
    const netAssetValue = useMemo(() => {
        if (!user || !user.wallets) return 0;
        return user.wallets.reduce((acc, wallet) => acc + (parseFloat(wallet.balance) || 0), 0);
    }, [user]);

    const walletNetworkHelper = (network: string) => {
        switch (network) {
            case 'TRON':
            case 'TRONNILE': return { color: 'text-red-600', bg: 'bg-red-50', icon: <img src="/coin-icons/tron-trx-logo.png" alt="TRX" className="h-5 w-5" /> };
            case 'ETHEREUM':
            case 'ETHEREUMSEPOLIA': return { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <img src="/coin-icons/ethereum-eth-logo.png" alt="ETH" className="h-5 w-5" /> };
            case 'SOLANA':
            case 'SOLANADEVNET': return { color: 'text-purple-600', bg: 'bg-purple-50', icon: <img src="/coin-icons/solana-sol-logo.png" alt="SOL" className="h-5 w-5" /> };
            case 'BITCOIN':
            case 'BITCOINTESTNET3': return { color: 'text-orange-600', bg: 'bg-orange-50', icon: <img src="/coin-icons/bitcoin-btc-logo.png" alt="BTC" className="h-5 w-5" /> };
            default: return { color: 'text-gray-600', bg: 'bg-gray-100', icon: <Wallet className="h-4 w-4" /> };
        }
    };

    const hasWallet = (network: string) => {
        if (!user?.wallets) return false;
        const mapping: Record<string, string> = {
            'TRONNILE': 'TRON',
            'ETHEREUMSEPOLIA': 'ETHEREUM',
            'SOLANADEVNET': 'SOLANA',
            'BITCOINTESTNET3': 'BITCOIN'
        };
        const targetNetwork = mapping[network] || network;
        return user.wallets.some(w => w.network === targetNetwork);
    };

    if (isLoading) return <div className="flex justify-center items-center h-[50vh] text-sm text-muted-foreground">Loading...</div>;
    if (error || !user) return <div className="flex justify-center items-center h-[50vh] text-red-500 text-sm">Error: {error || 'User not found'}</div>;

    return (
        <div className="w-full mx-auto p-3 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight leading-none">{user.name}</h1>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{user.userReferenceId}</span>
                            <span>•</span>
                            <span>{user.email}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'} className="text-xs uppercase scale-90">{user.status}</Badge>
                    <Badge variant="outline" className="text-xs scale-90">{user.role}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column: Quick Actions & Details */}
                <div className="space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2 p-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account Control</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-muted/50 p-2 rounded">
                                    <span className="block text-muted-foreground mb-1">Created</span>
                                    <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-muted/50 p-2 rounded">
                                    <span className="block text-muted-foreground mb-1">Status</span>
                                    <span className={`font-medium ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{user.status}</span>
                                </div>
                            </div>

                            {user.status !== 'ACTIVE' ? (
                                <Button size="sm" className="w-full h-8 bg-green-600 hover:bg-green-700 text-xs" onClick={() => handleStatusChange('ACTIVE')} disabled={isActionLoading}>
                                    Activate Account
                                </Button>
                            ) : (
                                <Button size="sm" variant="destructive" className="w-full h-8 text-xs" onClick={() => handleStatusChange('SUSPENDED')} disabled={isActionLoading}>
                                    Suspend Account
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Provisioning (Condensed) */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2 p-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Provision Wallets</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <div className="grid grid-cols-2 gap-2">
                                {!hasWallet('BITCOIN') && !hasWallet('BITCOINTESTNET3') && (
                                    <Button variant="outline" size="sm" className="h-7 text-xs justify-start" onClick={() => handleCreateWallet('BITCOIN')} disabled={isActionLoading}>
                                        <PlusCircle className="mr-1.5 h-3 w-3" /> BTC
                                    </Button>
                                )}
                                {!hasWallet('TRON') && !hasWallet('TRONNILE') && (
                                    <Button variant="outline" size="sm" className="h-7 text-xs justify-start" onClick={() => handleCreateWallet('TRON')} disabled={isActionLoading}>
                                        <PlusCircle className="mr-1.5 h-3 w-3" /> TRX
                                    </Button>
                                )}
                                {!hasWallet('ETHEREUM') && !hasWallet('ETHEREUMSEPOLIA') && (
                                    <Button variant="outline" size="sm" className="h-7 text-xs justify-start" onClick={() => handleCreateWallet('ETHEREUM')} disabled={isActionLoading}>
                                        <PlusCircle className="mr-1.5 h-3 w-3" /> ETH
                                    </Button>
                                )}
                                {!hasWallet('SOLANA') && !hasWallet('SOLANADEVNET') && (
                                    <Button variant="outline" size="sm" className="h-7 text-xs justify-start" onClick={() => handleCreateWallet('SOLANA')} disabled={isActionLoading}>
                                        <PlusCircle className="mr-1.5 h-3 w-3" /> SOL
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Assets */}
                <div className="lg:col-span-2 space-y-4">
                    {/* NAV Card */}
                    <Card className="bg-primary/5 border-primary/20 shadow-sm">
                        <CardContent className="p-3 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">Total Net Asset Value</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 hover:bg-primary/10"
                                        onClick={() => fetchUserDetails(false)}
                                        disabled={isRefreshing}
                                    >
                                        <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                                <div className="text-3xl font-bold flex items-baseline tracking-tight">
                                    <span className="text-lg mr-0.5 text-muted-foreground">$</span>
                                    {netAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    <span className="text-xs text-muted-foreground ml-2 font-medium">USDT Eq.</span>
                                </div>
                            </div>
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-sm">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Wallets List (Compact) */}
                    <Card className="shadow-sm py-3">
                        <CardHeader className="px-3 pb-2 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    <Wallet className="h-4 w-4 mr-2" />
                                    Assets Overview
                                </CardTitle>
                                <span className="text-xs text-muted-foreground">{user.wallets?.length || 0} Wallets</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {user.wallets && user.wallets.length > 0 ? (
                                <div className="divide-y">
                                    {user.wallets.map((wallet) => {
                                        const style = walletNetworkHelper(wallet.network);
                                        return (
                                            <div key={wallet.id} className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${style.bg} ${style.color}`}>
                                                        {style.icon}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold">{wallet.network}</span>
                                                            <Badge variant="secondary" className="text-[10px] h-4 px-1 rounded-sm">{wallet.currency}</Badge>
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5 max-w-[140px] truncate sm:max-w-none">
                                                            {wallet.address}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold font-mono">
                                                        {parseFloat(wallet.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    No wallets found. Provision one from the menu.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
