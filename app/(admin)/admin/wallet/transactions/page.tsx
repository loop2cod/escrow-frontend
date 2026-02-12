"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  ExternalLink,
  ArrowLeft,
  Wallet,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
} from "lucide-react";

interface Transaction {
  id: string;
  network: string;
  currency: string;
  decimals: number;
  status: string;
  kind: string;
  direction: string; // "in", "out", "incoming", "outgoing"
  hash?: string;
  dateCreated: string;
  amount: string;
  to?: string;
  from?: string;
  fee?: string | null;
}

// Helper to normalize direction values
const isIncomingTx = (direction: string): boolean => {
  return direction === "in" || direction === "incoming";
};

// Helper to display currency name nicely
const getDisplayCurrency = (currency: string): string => {
  // Map backend currency names to display names
  const currencyMap: Record<string, string> = {
    "NileTRX": "TRX",
    "TronNile": "TRX",
    "TRX": "TRX",
    "USDT": "USDT",
    "ETH": "ETH",
    "BTC": "BTC",
    "SOL": "SOL",
  };
  return currencyMap[currency] || currency;
};

interface WalletInfo {
  id: string;
  network: string;
  address: string;
  currency: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Explorer URL Helper
const getExplorerLink = (network: string, hash: string) => {
  if (!hash) return "#";
  const net = network.toLowerCase();

  if (net.includes("tron")) {
    return `https://nile.tronscan.org/#/transaction/${hash}`;
  }
  if (net.includes("eth")) {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  }
  if (net.includes("sol")) {
    return `https://explorer.solana.com/tx/${hash}?cluster=devnet`;
  }
  if (net.includes("bitcoin")) {
    return `https://mempool.space/testnet/tx/${hash}`;
  }
  return "#";
};

export default function AdminWalletTransactionsPage() {
  const searchParams = useSearchParams();
  const walletId = searchParams.get("walletId");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchTransactions = async (page: number = 1, refresh: boolean = false) => {
    if (!walletId) return;

    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (page === 1) {
        setIsLoading(true);
      }

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");

      const response = await apiClient.get(
        `/admin/wallets/${walletId}/transactions?${params.toString()}`
      );

      if (response.data.status && response.data.data) {
        setTransactions(response.data.data.transactions);
        setPagination(response.data.data.pagination);
        setWallet(response.data.data.wallet);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (walletId) {
      fetchTransactions(1);
    }
  }, [walletId]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTransactions(newPage);
    }
  };

  const handleRefresh = () => {
    fetchTransactions(pagination.page, true);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "completed":
        return <Badge className="bg-green-600 hover:bg-green-700 text-white">Completed</Badge>;
      case "pending":
      case "processing":
        return <Badge className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30">Pending</Badge>;
      case "failed":
      case "rejected":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!walletId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
        <Wallet className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">No Wallet Selected</h2>
        <p className="text-muted-foreground">Please select a wallet from settings to view transactions.</p>
        <Link href="/admin/settings">
          <Button>Go to Settings</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet Transactions</h1>
          <p className="text-sm text-muted-foreground">
            {wallet?.network} • {wallet?.address.slice(0, 12)}...{wallet?.address.slice(-8)}
          </p>
        </div>
      </div>

      {/* Wallet Info Card */}
      {wallet && (
        <Card className="bg-gradient-to-br from-primary/5 via-card to-muted/20 border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{wallet.network}</h2>
                  <code className="text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                    {wallet.address}
                  </code>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              {pagination.total} total transactions
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const isIncoming = isIncomingTx(tx.direction);
                    const explorerLink = getExplorerLink(tx.network, tx.hash || "");
                    const displayCurrency = getDisplayCurrency(tx.currency);

                    return (
                      <TableRow key={tx.id}>
                        {/* Type - IN/OUT */}
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isIncoming ? (
                              <div className="flex items-center gap-1.5">
                                <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                  <ArrowDownLeft className="h-3.5 w-3.5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-emerald-600 font-semibold text-sm">IN</span>
                                  <span className="text-[10px] text-muted-foreground capitalize">
                                    {tx.kind?.replace(/([A-Z])/g, ' $1').trim() || 'Receive'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                                  <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-blue-600 font-semibold text-sm">OUT</span>
                                  <span className="text-[10px] text-muted-foreground capitalize">
                                    {tx.kind?.replace(/([A-Z])/g, ' $1').trim() || 'Send'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Asset */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold">{displayCurrency}</span>
                            <span className="text-xs text-muted-foreground">{tx.network}</span>
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={`font-bold ${isIncoming ? 'text-emerald-600' : 'text-blue-600'}`}>
                              {isIncoming ? '+' : '-'}
                              {parseFloat(tx.amount || '0').toLocaleString(undefined, { maximumFractionDigits: 6 })}
                            </span>
                            {!isIncoming && tx.fee && (
                              <span className="text-[10px] text-muted-foreground">
                                Fee: {parseFloat(tx.fee).toFixed(6)}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>

                        {/* Time */}
                        <TableCell className="text-muted-foreground">
                          {tx.dateCreated ? new Date(tx.dateCreated).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : '-'}
                        </TableCell>

                        {/* Hash */}
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {tx.hash ? (
                            <a
                              href={explorerLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex justify-end gap-1 items-center hover:text-primary transition-colors"
                              title="View on Explorer"
                            >
                              {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 6)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage || isRefreshing}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage || isRefreshing}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Clock className="h-10 w-10 mb-4 opacity-20" />
              <p>No transactions found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
