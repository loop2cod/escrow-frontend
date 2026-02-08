'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import apiClient from '@/lib/api-client';
import {
    Wallet,
    ArrowLeft,
    RefreshCw,
    DollarSign,
    PlusCircle,
    ShoppingCart,
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    CreditCard,
    Play,
    User,
    Mail,
    Shield,
    Copy,
    Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Contract {
    id: string;
    title: string;
    totalAmount: string;
    currency: string;
    status: string;
    createdAt: string;
    seller?: { id: string; name: string; email: string };
    buyer?: { id: string; name: string; email: string };
    _count?: { milestones: number };
}

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
        network: 'TRON' | 'ETHEREUM' | 'BITCOIN';
        address: string;
        currency: string;
        balance: string;
        status: string;
    }[];
    buyerContracts: Contract[];
    sellerContracts: Contract[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    DRAFT: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted", icon: FileText },
    PENDING_REVIEW: { label: "Pending Review", color: "text-amber-600", bg: "bg-amber-100", icon: Clock },
    PENDING_ACCEPTANCE: { label: "Pending Acceptance", color: "text-blue-600", bg: "bg-blue-100", icon: User },
    AGREED: { label: "Agreed", color: "text-emerald-600", bg: "bg-emerald-100", icon: CheckCircle2 },
    PAYMENT_SUBMITTED: { label: "Payment Submitted", color: "text-orange-600", bg: "bg-orange-100", icon: CreditCard },
    IN_PROGRESS: { label: "In Progress", color: "text-indigo-600", bg: "bg-indigo-100", icon: Play },
    DELIVERED: { label: "Delivered", color: "text-purple-600", bg: "bg-purple-100", icon: Package },
    DELIVERY_REVIEWED: { label: "Delivery Reviewed", color: "text-cyan-600", bg: "bg-cyan-100", icon: CheckCircle2 },
    COMPLETED: { label: "Completed", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-100", icon: XCircle },
    REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-100", icon: XCircle },
    DISPUTED: { label: "Disputed", color: "text-red-600", bg: "bg-red-100", icon: AlertCircle },
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');

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
            toast({ title: "Success", description: `User status updated to ${newStatus}` });
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.message || "Failed to update status", variant: "destructive" });
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
            toast({ title: "Success", description: `${network} wallet created` });
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.message || "Failed to create wallet", variant: "destructive" });
        } finally {
            setIsActionLoading(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: `${label} copied to clipboard` });
    };

    // Calculate Total Net Asset Value
    const netAssetValue = useMemo(() => {
        if (!user || !user.wallets) return 0;
        return user.wallets.reduce((acc, wallet) => acc + (parseFloat(wallet.balance) || 0), 0);
    }, [user]);

    // Calculate order stats
    const orderStats = useMemo(() => {
        if (!user) return { buying: 0, selling: 0, total: 0, completed: 0, active: 0 };
        const buying = user.buyerContracts?.length || 0;
        const selling = user.sellerContracts?.length || 0;
        const allContracts = [...(user.buyerContracts || []), ...(user.sellerContracts || [])];
        const completed = allContracts.filter(c => c.status === 'COMPLETED').length;
        const active = allContracts.filter(c => ['AGREED', 'PAYMENT_SUBMITTED', 'IN_PROGRESS', 'DELIVERED'].includes(c.status)).length;
        return { buying, selling, total: buying + selling, completed, active };
    }, [user]);

    const walletNetworkHelper = (network: string) => {
        switch (network) {
            case 'TRON':
            case 'TRONNILE': return { color: 'text-red-600', bg: 'bg-red-50', icon: 'TRX', chain: 'Tron' };
            case 'ETHEREUM':
            case 'ETHEREUMSEPOLIA': return { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: 'ETH', chain: 'Ethereum' };
            case 'BITCOIN':
            case 'BITCOINTESTNET3': return { color: 'text-orange-600', bg: 'bg-orange-50', icon: 'BTC', chain: 'Bitcoin' };
            default: return { color: 'text-gray-600', bg: 'bg-gray-100', icon: 'WALLET', chain: network };
        }
    };

    const hasWallet = (network: string) => {
        if (!user?.wallets) return false;
        const mapping: Record<string, string> = {
            'TRONNILE': 'TRON',
            'ETHEREUMSEPOLIA': 'ETHEREUM',
            'BITCOINTESTNET3': 'BITCOIN'
        };
        const targetNetwork = mapping[network] || network;
        return user.wallets.some(w => w.network === targetNetwork);
    };

    const renderContractCard = (contract: Contract, type: 'buying' | 'selling') => {
        const config = STATUS_CONFIG[contract.status] || STATUS_CONFIG.DRAFT;
        const StatusIcon = config.icon;
        const counterparty = type === 'buying' ? contract.seller : contract.buyer;

        return (
            <Link key={contract.id} href={`/admin/orders/${contract.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm p-0">
                    <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm truncate">{contract.title}</h4>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{type === 'buying' ? 'Buying from' : 'Selling to'} {counterparty?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge className={`${config.bg} ${config.color} border-0 text-[10px]`}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {config.label}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {contract._count?.milestones || 0} milestones
                                    </span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-semibold text-sm">
                                    {parseFloat(contract.totalAmount).toLocaleString()} {contract.currency}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    {format(new Date(contract.createdAt), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        );
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading user details...</p>
            </div>
        </div>
    );

    if (error || !user) return (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
                <h2 className="text-xl font-semibold">Error</h2>
                <p className="text-muted-foreground mt-1">{error || 'User not found'}</p>
            </div>
            <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
            </Button>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-bold tracking-tight">{user.name}</h1>
                            <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'} className="text-[10px]">
                                {user.status}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">{user.role}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" /> {user.userReferenceId}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchUserDetails(false)}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    {user.status !== 'ACTIVE' ? (
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange('ACTIVE')}
                            disabled={isActionLoading}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Activate
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange('SUSPENDED')}
                            disabled={isActionLoading}
                        >
                            <XCircle className="h-4 w-4 mr-2" /> Suspend
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Buying Orders</p>
                        <p className="text-2xl font-bold">{orderStats.buying}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Selling Orders</p>
                        <p className="text-2xl font-bold">{orderStats.selling}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Active Orders</p>
                        <p className="text-2xl font-bold">{orderStats.active}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500/10 to-green-500/5">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Completed</p>
                        <p className="text-2xl font-bold">{orderStats.completed}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: User Info & Wallets */}
                <div className="space-y-6">
                    {/* User Info Card */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <User className="h-4 w-4" /> Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                                    <p className="font-medium">{format(new Date(user.createdAt), 'MMM d, yyyy')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                                    <p className={`font-medium ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                        {user.status}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">User Reference ID</p>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1 truncate">
                                        {user.userReferenceId}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => copyToClipboard(user.userReferenceId || '', 'Reference ID')}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* NAV Card */}
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 to-primary/5">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Total Balance</p>
                                    <div className="text-3xl font-bold flex items-baseline">
                                        <span className="text-lg mr-0.5 text-muted-foreground">$</span>
                                        {netAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Wallets List */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Wallet className="h-4 w-4" /> Wallets
                                </CardTitle>
                                <span className="text-xs text-muted-foreground">{user.wallets?.length || 0}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {user.wallets && user.wallets.length > 0 ? (
                                user.wallets.map((wallet) => {
                                    const style = walletNetworkHelper(wallet.network);
                                    return (
                                        <div key={wallet.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${style.bg} ${style.color} font-bold text-xs`}>
                                                    {style.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{style.chain}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                                                        {wallet.address}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold font-mono">
                                                    {parseFloat(wallet.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">{wallet.currency}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-4">No wallets found</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Provision Wallets */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Create Wallet</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2">
                                {!hasWallet('BITCOIN') && !hasWallet('BITCOINTESTNET3') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-xs"
                                        onClick={() => handleCreateWallet('BITCOIN')}
                                        disabled={isActionLoading}
                                    >
                                        <PlusCircle className="mr-1 h-3 w-3" /> BTC
                                    </Button>
                                )}
                                {!hasWallet('TRON') && !hasWallet('TRONNILE') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-xs"
                                        onClick={() => handleCreateWallet('TRON')}
                                        disabled={isActionLoading}
                                    >
                                        <PlusCircle className="mr-1 h-3 w-3" /> TRX
                                    </Button>
                                )}
                                {!hasWallet('ETHEREUM') && !hasWallet('ETHEREUMSEPOLIA') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-xs"
                                        onClick={() => handleCreateWallet('ETHEREUM')}
                                        disabled={isActionLoading}
                                    >
                                        <PlusCircle className="mr-1 h-3 w-3" /> ETH
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Orders */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Orders Tabs */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4" /> Orders
                                </CardTitle>
                                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                    <button
                                        onClick={() => setActiveTab('buying')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'buying'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        Buying ({orderStats.buying})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('selling')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'selling'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        Selling ({orderStats.selling})
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                {activeTab === 'buying' ? (
                                    user.buyerContracts && user.buyerContracts.length > 0 ? (
                                        user.buyerContracts.map(contract => renderContractCard(contract, 'buying'))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No buying orders</p>
                                        </div>
                                    )
                                ) : (
                                    user.sellerContracts && user.sellerContracts.length > 0 ? (
                                        user.sellerContracts.map(contract => renderContractCard(contract, 'selling'))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No selling orders</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
