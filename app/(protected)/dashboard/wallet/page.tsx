"use client";

import { useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/api-client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  ArrowRightLeft,
  Plus,
  History,
  Wallet,
  Building2,
  Landmark
} from "lucide-react";
import Link from "next/link";
import { RecentTransactionsPreview } from "@/components/wallet/recent-transactions-preview";

interface WalletData {
  id: string;
  network: 'TRON' | 'ETHEREUM' | 'SOLANA' | 'BITCOIN';
  address: string;
  currency: string;
  balance: string;
  status: string;
}

export default function WalletPage() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      else setIsRefreshing(true);

      const response = await apiClient.get('/wallets');
      setWallets(response.data.data.wallets);
    } catch (err: any) {
      console.error('Failed to fetch wallets', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const netAssetValue = useMemo(() => {
    if (!wallets) return 0;
    return wallets.reduce((acc, wallet) => acc + (parseFloat(wallet.balance) || 0), 0);
  }, [wallets]);

  const walletNetworkHelper = (network: string) => {
    switch (network) {
      case 'TRON': return {
        icon: <img src="/coin-icons/tether-usdt-logo.png" alt="TRX" className='h-8 w-8' />,
        symbol: 'TRX'
      };
      case 'ETHEREUM': return {
        icon: <img src="/coin-icons/tether-usdt-logo.png" alt="ETH" className='h-8 w-8' />,
        symbol: 'ETH'
      };
      case 'SOLANA': return {
        icon: <img src="/coin-icons/tether-usdt-logo.png" alt="SOL" className='h-8 w-8' />,
        symbol: 'SOL'
      };
      case 'BITCOIN': return {
        icon: <img src="/coin-icons/tether-usdt-logo.png" alt="BTC" className='h-8 w-8' />,
        symbol: 'BTC'
      };
      default: return {
        icon: <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center"><Wallet className="h-4 w-4 text-muted-foreground" /></div>,
        symbol: network
      };
    }
  };

  const getNetworkIconPath = (network: string) => {
    switch (network) {
      case 'TRON': return '/coin-icons/tron-trx-logo.png';
      case 'ETHEREUM': return '/coin-icons/ethereum-eth-logo.png';
      case 'SOLANA': return '/coin-icons/solana-sol-logo.png';
      case 'BITCOIN': return '/coin-icons/bitcoin-btc-logo.png';
      default: return null;
    }
  };

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center text-sm text-muted-foreground animate-pulse">Loading assets...</div>;

  return (
    <div className="flex-1 space-y-6">

      {/* Header aligned with Dashboard */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground text-sm">
            Manage your crypto and fiat assets
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchWallets(false)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Tabs Container */}
      <Tabs defaultValue="crypto" className="space-y-4">
        <TabsList>
          <TabsTrigger value="crypto">Crypto Assets</TabsTrigger>
          <TabsTrigger value="fiat">Fiat Accounts</TabsTrigger>
        </TabsList>

        {/* ================= CRYPTO TAB ================= */}
        <TabsContent value="crypto" className="space-y-4 focus-visible:outline-none">

          {/* 1. Crypto Balance & Quick Actions Card */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm font-medium">Total Balance</span>
                  <button onClick={() => setShowBalance(!showBalance)} className="hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                    {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold tracking-tight">
                    {showBalance ? `$${netAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '******'}
                  </span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    USDT Est.
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 w-full md:w-auto">
                <Link href="/dashboard/wallet/receive" className="flex-1 md:flex-none">
                  <Button className="w-full md:w-32 gap-2 cursor-pointer" variant="secondary">
                    <ArrowDownLeft className="h-4 w-4" /> Receive
                  </Button>
                </Link>
                <Link href="/dashboard/wallet/send" className="flex-1 md:flex-none">
                  <Button className="w-full md:w-32 gap-2 cursor-pointer" variant="secondary">
                    <ArrowUpRight className="h-4 w-4" /> Send
                  </Button>
                </Link>
                <Button disabled className="flex-1 md:flex-none w-full md:w-32 gap-2 border-dashed opacity-50 cursor-not-allowed" variant="outline">
                  <ArrowRightLeft className="h-4 w-4" /> Swap
                </Button>
              </div>
            </div>
          </Card>

          {/* 2. Crypto Assets List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">My Assets</h2>
            <div className="grid gap-3">
              {wallets.length > 0 ? (
                wallets.map((wallet) => {
                  const { icon } = walletNetworkHelper(wallet.network);
                  const isCopied = copiedId === wallet.id;

                  return (
                    <div key={wallet.id} className="group flex items-center justify-between p-3 border bg-card hover:border-primary/50 hover:shadow-sm transition-all">
                      {/* Left: Icon & Name */}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {icon}
                          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-background flex items-center justify-center border shadow-sm overflow-hidden p-[1px]">
                            {getNetworkIconPath(wallet.network) ? (
                              <img
                                src={getNetworkIconPath(wallet.network)!}
                                alt={wallet.network}
                                className="h-full w-full object-contain rounded-full"
                              />
                            ) : (
                              <span className="text-[8px] font-bold text-muted-foreground leading-none">{wallet.network[0]}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base">{wallet.currency}</span>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1 font-normal text-muted-foreground bg-muted/50">{wallet.network}</Badge>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px] sm:max-w-[200px] select-all">
                              {wallet.address}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(wallet.address, wallet.id);
                              }}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Balance */}
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {showBalance ? parseFloat(wallet.balance).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '******'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {showBalance ? `$${parseFloat(wallet.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '******'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
                  <Wallet className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No crypto assets found</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Crypto Transaction History Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">History</h2>
              <Link href="/dashboard/wallet/transactions" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <Card className="shadow-none border py-0">
              <div className="p-0">
                <RecentTransactionsPreview />
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ================= FIAT TAB ================= */}
        <TabsContent value="fiat" className="space-y-4 focus-visible:outline-none">

          {/* 1. Fiat Balance (Placeholder) */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm font-medium">Cash Balance</span>
                  <button onClick={() => setShowBalance(!showBalance)} className="hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
                    {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold tracking-tight">
                    {showBalance ? '$0.00' : '******'}
                  </span>
                  <Badge variant="secondary" className="text-xs font-normal">USD</Badge>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Button disabled className="flex-1 md:flex-none w-full md:w-32 gap-2 opacity-50 cursor-not-allowed" variant="default">
                  <Plus className="h-4 w-4" /> Deposit
                </Button>
                <Button disabled className="flex-1 md:flex-none w-full md:w-32 gap-2 opacity-50 cursor-not-allowed" variant="outline">
                  <Landmark className="h-4 w-4" /> Withdraw
                </Button>
              </div>
            </div>
          </Card>

          {/* 2. Fiat Accounts List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Bank Accounts</h2>
              <Button variant="ghost" size="sm" disabled className="text-muted-foreground opacity-50">Manage Accounts</Button>
            </div>

            <Card className="border-dashed bg-muted/5 shadow-none">
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Building2 className="h-10 w-10 mb-3 opacity-20" />
                <h3 className="text-sm font-medium text-foreground">No accounts linked</h3>
                <p className="text-xs mt-1">Bank integration is coming soon.</p>
                <Button variant="outline" size="sm" className="mt-4" disabled>
                  Link Account
                </Button>
              </div>
            </Card>
          </div>

        </TabsContent>
      </Tabs>
    </div>
  );
}
