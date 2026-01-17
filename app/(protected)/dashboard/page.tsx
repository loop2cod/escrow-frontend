"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import apiClient from "@/lib/api-client";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  ShoppingCart,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  Loader2,
  DollarSign,
  Lock,
  RefreshCcw
} from "lucide-react";

interface WalletData {
  id: string;
  currency: string;
  network: string;
  balance: string;
}

interface Contract {
  id: string;
  title: string;
  status: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  buyer: { name: string };
  seller: { name: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [volumeData, setVolumeData] = useState<{ name: string; total: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      else setIsRefreshing(true);

      const [walletsRes, contractsRes, volumeRes] = await Promise.all([
        apiClient.get<{ data: { wallets: WalletData[] } }>('/wallets'),
        apiClient.get<{ data: { contracts: Contract[] } }>('/contracts'),
        apiClient.get<{ data: { volume: { name: string; total: number }[] } }>('/wallets/analytics/volume')
      ]);

      setWallets(walletsRes.data.data.wallets || []);
      setContracts(contractsRes.data.data.contracts || []);
      setVolumeData(volumeRes.data.data.volume || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Don't crash UI on fetch failure
      if (showLoading) setIsLoading(false);
      else setIsRefreshing(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate statistics
  const totalBalance = wallets.reduce((sum, wallet) => {
    return sum + parseFloat(wallet.balance || '0');
  }, 0);

  const lockedFunds = contracts
    .filter(c => ['IN_PROGRESS', 'AGREED', 'PAYMENT_SUBMITTED'].includes(c.status))
    .reduce((sum, c) => sum + parseFloat(c.totalAmount || '0'), 0);

  const contractStats = {
    active: contracts.filter(c => ['IN_PROGRESS', 'AGREED', 'PAYMENT_SUBMITTED'].includes(c.status)).length,
    pending: contracts.filter(c => ['PENDING_REVIEW', 'PENDING_ACCEPTANCE', 'DELIVERED', 'DELIVERY_REVIEWED'].includes(c.status)).length,
    completed: contracts.filter(c => c.status === 'COMPLETED').length,
    disputed: contracts.filter(c => c.status === 'DISPUTED').length,
  };

  const recentContracts = contracts.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'IN_PROGRESS':
      case 'AGREED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PENDING_REVIEW':
      case 'PENDING_ACCEPTANCE':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your escrow activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchData(false)} disabled={isLoading || isRefreshing} className="shadow-sm">
            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => router.push('/dashboard/orders/create')} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> Create Order
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-all duration-200 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Available across {wallets.length} wallets</p>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => router.push('/dashboard/wallet')}>
                Manage Wallets <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-background">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Locked in Escrow</CardTitle>
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Lock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">${lockedFunds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-2">Funds currently in active orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Chart & Stats */}
      <div className="grid md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7 space-y-4">

        {/* Chart Area */}
        <div className="col-span-4">
          <DashboardChart data={volumeData} />
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-3">
          <div className="grid gap-4 grid-cols-2 w-full">
            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-blue-500/50 w-full" onClick={() => router.push('/dashboard/orders')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Active</CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{contractStats.active}</div>
                <p className="text-[10px] text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-yellow-500/50 w-full" onClick={() => router.push('/dashboard/orders')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{contractStats.pending}</div>
                <p className="text-[10px] text-muted-foreground">Action needed</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-green-500/50 w-full" onClick={() => router.push('/dashboard/orders')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{contractStats.completed}</div>
                <p className="text-[10px] text-muted-foreground">Closed</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all cursor-pointer hover:border-red-500/50 w-full" onClick={() => router.push('/dashboard/orders')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Disputed</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{contractStats.disputed}</div>
                <p className="text-[10px] text-muted-foreground">Reviewing</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/orders')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {recentContracts.length > 0 ? (
          <Card className="py-0">
            <CardContent className="p-0">
              <div className="divide-y">
                {recentContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/orders/${contract.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{contract.title}</h3>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(contract.status)}`}>
                            {contract.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Buyer: {contract.buyer.name}</span>
                          <Separator orientation="vertical" className="h-3" />
                          <span>Seller: {contract.seller.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {parseFloat(contract.totalAmount).toLocaleString()} {contract.currency}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first escrow order to get started</p>
              <Button onClick={() => router.push('/dashboard/orders/create')}>
                <Plus className="h-4 w-4 mr-2" /> Create Order
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/orders/create')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Create New Order</CardTitle>
                  <CardDescription className="text-xs">Start a new escrow transaction</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/wallet')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Manage Wallets</CardTitle>
                  <CardDescription className="text-xs">View and manage your wallets</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/orders')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base">View All Orders</CardTitle>
                  <CardDescription className="text-xs">See your complete order history</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
