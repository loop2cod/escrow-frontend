"use client";

import { useWalletStore } from "@/lib/store/wallet-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Unlock,
  ArrowLeftRight,
  Clock,
  Search,
  Filter,
  ExternalLink,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  TransactionType,
  TransactionStatus,
  CurrencyType,
  WalletTransaction,
} from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getTransactionIcon(type: string, status: string) {
  if (status === "pending") {
    return <Clock className="h-5 w-5 text-yellow-600" />;
  }

  switch (type) {
    case "deposit":
      return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
    case "withdraw":
      return <ArrowUpCircle className="h-5 w-5 text-blue-600" />;
    case "escrow_lock":
      return <Lock className="h-5 w-5 text-orange-600" />;
    case "escrow_release":
      return <Unlock className="h-5 w-5 text-green-600" />;
    case "convert":
      return <ArrowLeftRight className="h-5 w-5 text-purple-600" />;
    default:
      return <ArrowLeftRight className="h-5 w-5 text-gray-600" />;
  }
}

function getStatusBadge(status: TransactionStatus) {
  const variants: Record<TransactionStatus, { variant: any; label: string }> = {
    completed: { variant: "default", label: "Completed" },
    pending: { variant: "secondary", label: "Pending" },
    failed: { variant: "destructive", label: "Failed" },
    cancelled: { variant: "outline", label: "Cancelled" },
  };

  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const isPositive =
    transaction.type === "deposit" || transaction.type === "escrow_release";
  const isNegative =
    transaction.type === "withdraw" || transaction.type === "escrow_lock";

  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-0 hover:bg-muted/50 px-4 -mx-4 rounded-md transition-colors">
      <div className="flex-shrink-0">
        {getTransactionIcon(transaction.type, transaction.status)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium truncate">
            {transaction.description ||
              transaction.type.replace("_", " ").toUpperCase()}
          </p>
          {getStatusBadge(transaction.status)}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(transaction.createdAt)}</span>
          <span>•</span>
          <span className="font-mono">{transaction.id}</span>
          {transaction.txHash && (
            <>
              <span>•</span>
              <a
                href={`https://tronscan.org/#/transaction/${transaction.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline text-primary"
              >
                View on Blockchain
                <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <p
          className={`text-sm font-semibold ${isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-600"}`}
        >
          {isPositive ? "+" : isNegative ? "-" : ""}
          {transaction.amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}{" "}
          {transaction.currency}
        </p>
        {transaction.fee > 0 && (
          <p className="text-xs text-muted-foreground">Fee: {transaction.fee.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const { transactions, isLoading, fetchTransactions } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
    "all"
  );
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyType | "all">(
    "all"
  );

  useEffect(() => {
    const filters: any = {};
    if (typeFilter !== "all") filters.type = typeFilter;
    if (statusFilter !== "all") filters.status = statusFilter;
    if (currencyFilter !== "all") filters.currency = currencyFilter;
    if (searchQuery) filters.search = searchQuery;

    fetchTransactions(filters);
  }, [typeFilter, statusFilter, currencyFilter, searchQuery, fetchTransactions]);

  const handleExport = () => {
    // Mock export functionality
    const csv = [
      "ID,Type,Status,Amount,Currency,Date,Description",
      ...transactions.map(
        (tx) =>
          `${tx.id},${tx.type},${tx.status},${tx.amount},${tx.currency},${tx.createdAt},${tx.description || ""}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all your wallet transactions
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as TransactionType | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdraw">Withdraw</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="escrow_lock">Escrow Lock</SelectItem>
                  <SelectItem value="escrow_release">Escrow Release</SelectItem>
                  <SelectItem value="convert">Convert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as TransactionStatus | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Select
                value={currencyFilter}
                onValueChange={(value) =>
                  setCurrencyFilter(value as CurrencyType | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currencies</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="TRX">TRX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            <span className="text-sm font-normal text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-4 animate-pulse">
                  <div className="h-5 w-5 bg-muted rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded"></div>
                    <div className="h-3 w-1/2 bg-muted rounded"></div>
                  </div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div>
              {transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No transactions found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
