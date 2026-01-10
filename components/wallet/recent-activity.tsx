"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWalletStore } from "@/lib/store/wallet-store";
import { useEffect } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Unlock,
  ArrowLeftRight,
  Clock
} from "lucide-react";
import { WalletTransaction } from "@/lib/types";
import Link from "next/link";

function getTransactionIcon(type: string, status: string) {
  if (status === 'pending') {
    return <Clock className="h-4 w-4 text-yellow-600" />;
  }

  switch (type) {
    case 'deposit':
      return <ArrowDownCircle className="h-4 w-4 text-green-600" />;
    case 'withdraw':
      return <ArrowUpCircle className="h-4 w-4 text-blue-600" />;
    case 'escrow_lock':
      return <Lock className="h-4 w-4 text-orange-600" />;
    case 'escrow_release':
      return <Unlock className="h-4 w-4 text-green-600" />;
    case 'convert':
      return <ArrowLeftRight className="h-4 w-4 text-purple-600" />;
    default:
      return <ArrowLeftRight className="h-4 w-4 text-gray-600" />;
  }
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function TransactionItem({ transaction }: { transaction: WalletTransaction }) {
  const isPositive = transaction.type === 'deposit' || transaction.type === 'escrow_release';
  const isNegative = transaction.type === 'withdraw' || transaction.type === 'escrow_lock';

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className="flex-shrink-0">
        {getTransactionIcon(transaction.type, transaction.status)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {transaction.description || transaction.type.replace('_', ' ')}
        </p>
        <p className="text-xs text-muted-foreground">
          {getRelativeTime(transaction.createdAt)}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className={`text-sm font-semibold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
          {isPositive ? '+' : isNegative ? '-' : ''}{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {transaction.currency}
        </p>
        {transaction.status === 'pending' && (
          <p className="text-xs text-yellow-600">Pending</p>
        )}
      </div>
    </div>
  );
}

export function RecentActivity() {
  const { transactions, isLoading, fetchTransactions } = useWalletStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Link
          href="/dashboard/wallet/transactions"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                <div className="h-4 w-4 bg-muted rounded"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-muted rounded"></div>
                </div>
                <div className="h-4 w-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : recentTransactions.length > 0 ? (
          <div>
            {recentTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
