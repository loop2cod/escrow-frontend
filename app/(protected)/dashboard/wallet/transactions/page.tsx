"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Loader2,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  network: string;
  currency: string;
  status: string;
  kind: string;
  direction?: 'incoming' | 'outgoing' | 'in' | 'out';
  hash?: string;
  dateCreated: string;
  amount?: string;
  fee?: string; // Add fee support if backend provides it, otherwise might verify later
}

// Explorer URL Helper
const getExplorerLink = (network: string, hash: string) => {
  if (!hash) return '#';
  const net = network.toLowerCase();

  if (net.includes('tron')) {
    // Assume Nile for dev, ideally env var or strictly checked
    return `https://nile.tronscan.org/#/transaction/${hash}`;
  }
  if (net.includes('eth')) {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  }
  if (net.includes('sol')) {
    return `https://explorer.solana.com/tx/${hash}?cluster=devnet`;
  }
  if (net.includes('bitcoin')) {
    return `https://mempool.space/testnet/tx/${hash}`;
  }
  return '#';
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/wallets/transactions');
      setTransactions(response.data.data.transactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Completed</Badge>;
      case 'pending':
      case 'processing':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      case 'failed':
      case 'rejected':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 pt-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/wallet">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">View your complete wallet history.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
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
                {transactions.map((tx: any) => {
                  const isIncoming = tx.direction === 'in' || tx.direction === 'incoming';
                  const explorerLink = getExplorerLink(tx.network, tx.hash || '');

                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isIncoming ? <ArrowDownLeft className="h-4 w-4 text-green-500" /> : <ArrowUpRight className="h-4 w-4 text-blue-500" />}
                          <div className="flex flex-col">
                            <span className="capitalize">{isIncoming ? 'Receive' : 'Send'}</span>
                            <span className="text-[10px] text-muted-foreground capitalize font-normal">
                              {tx.kind?.replace(/([A-Z])/g, ' $1').trim() || 'Transfer'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{tx.currency || 'USDT'}</span>
                          <span className="text-xs text-muted-foreground">{tx.network}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${isIncoming ? 'text-green-600' : ''}`}>
                          {isIncoming ? '+' : ''}{parseFloat(tx.amount || '0').toLocaleString(undefined, { maximumFractionDigits: 6 })}
                        </span>
                        {/* Fee display if available (mostly for outgoing) */}
                        {!isIncoming && tx.fee && (
                          <div className="text-[10px] text-muted-foreground">Fee: {tx.fee}</div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {tx.dateCreated ? new Date(tx.dateCreated).toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                          month: 'short',
                          day: 'numeric'
                        }) : '-'}
                      </TableCell>
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
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
