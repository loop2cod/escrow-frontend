"use client";

import { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  RefreshCw,
  Loader2,
  AlertCircle,
  Activity,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  User,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Transfer {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string } | null;
  wallet: { id: string; network: string; address: string } | null;
  txHash: string;
  network: string;
  direction: string;
  tokenSymbol: string | null;
  amount: number | null;
  fiatValue: number | null;
  fiatCurrency: string;
  riskLevel: string | null;
  riskScore: number | null;
  registeredAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  risk_level: string;
  network: string;
  direction: string;
  tx_hash: string;
  start_date: string;
  end_date: string;
}

interface TransfersData {
  transfers: Transfer[];
  pagination: Pagination;
  filters: Filters;
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Shield className="h-4 w-4" />
      <Link href="/admin/kyt" className="hover:text-foreground">KYT</Link>
      <span>/</span>
      <span className="text-foreground font-medium">Transfers</span>
    </nav>
  );
}

function RiskBadge({ riskLevel }: { riskLevel: string | null }) {
  const getRiskColor = (risk: string | null) => {
    switch (risk) {
      case "none": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "low": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "severe": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };
  return (
    <Badge variant="outline" className={`${getRiskColor(riskLevel)} text-xs`}>
      {riskLevel || "undefined"}
    </Badge>
  );
}

function DirectionBadge({ direction }: { direction: string }) {
  const isIncoming = direction === "incoming";
  return (
    <Badge variant="outline" className={`text-xs ${isIncoming ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}>
      {isIncoming ? "↓ In" : "↑ Out"}
    </Badge>
  );
}

function NetworkBadge({ network }: { network: string }) {
  const getNetworkColor = (net: string) => {
    switch (net.toUpperCase()) {
      case "TRX": case "TRON": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "ETH": case "ETHEREUM": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "BTC": case "BITCOIN": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };
  return (
    <Badge variant="outline" className={`${getNetworkColor(network)} text-xs`}>
      {network}
    </Badge>
  );
}

function FilterPanel({ filters, onFilterChange, onApply, onReset }: {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <Card className="p-4 border-0 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Filters</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Risk Level</label>
          <select value={filters.risk_level} onChange={(e) => onFilterChange("risk_level", e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
            <option value="">All</option>
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="severe">Severe</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Network</label>
          <select value={filters.network} onChange={(e) => onFilterChange("network", e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
            <option value="">All</option>
            <option value="TRX">TRX (Tron)</option>
            <option value="ETH">ETH (Ethereum)</option>
            <option value="BTC">BTC (Bitcoin)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Direction</label>
          <select value={filters.direction} onChange={(e) => onFilterChange("direction", e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
            <option value="">All</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">TX Hash</label>
          <Input placeholder="Search..." value={filters.tx_hash}
            onChange={(e) => onFilterChange("tx_hash", e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={onApply} className="h-9 text-sm flex-1">Apply</Button>
          <Button onClick={onReset} variant="outline" className="h-9 text-sm">Reset</Button>
        </div>
      </div>
    </Card>
  );
}

function TransfersTable({ transfers }: { transfers: Transfer[] }) {
  const truncateHash = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  const formatAmount = (amount: number | null, symbol: string | null) =>
    amount === null ? "N/A" : `${amount.toLocaleString()} ${symbol || ""}`;
  const formatFiat = (value: number | null, currency: string) =>
    value === null ? "N/A" : `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  if (transfers.length === 0) {
    return (
      <Card className="p-8 border-0 shadow-lg text-center">
        <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No transfers found</p>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">TX Hash</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Network</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Direction</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Risk</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transfers.map((transfer) => (
              <tr key={transfer.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{transfer.user?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{transfer.user?.email || ""}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{truncateHash(transfer.txHash)}</code>
                </td>
                <td className="px-4 py-3"><NetworkBadge network={transfer.network} /></td>
                <td className="px-4 py-3"><DirectionBadge direction={transfer.direction} /></td>
                <td className="px-4 py-3"><p className="text-sm font-medium">{formatAmount(transfer.amount, transfer.tokenSymbol)}</p></td>
                <td className="px-4 py-3"><RiskBadge riskLevel={transfer.riskLevel} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(transfer.registeredAt), "MMM d, HH:mm")}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                    <Link href={`/admin/kyt/transfers/${transfer.id}`}>
                      <ExternalLink className="h-3 w-3 mr-1" />View
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function KytTransfers() {
  const [data, setData] = useState<TransfersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ risk_level: "", network: "", direction: "", tx_hash: "", start_date: "", end_date: "" });
  const [page, setPage] = useState(1);

  const fetchTransfers = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");
      if (filters.risk_level) params.append("risk_level", filters.risk_level);
      if (filters.network) params.append("network", filters.network);
      if (filters.direction) params.append("direction", filters.direction);
      if (filters.tx_hash) params.append("tx_hash", filters.tx_hash);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      const response = await apiClient.get(`/kyt/admin/transfers?${params.toString()}`);
      if (response.data.status && response.data.data) {
        setData(response.data.data);
      } else {
        setError(response.data.message || "Invalid response from server");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load transfers");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading transfers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => fetchTransfers()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Breadcrumb />
        <Button variant="ghost" size="sm" onClick={() => fetchTransfers()} className="gap-2">
          <RefreshCw className="h-4 w-4" />Refresh
        </Button>
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Transfers</h1>
        <p className="text-muted-foreground mt-1 text-sm">Monitor and review all cryptocurrency transfers</p>
      </div>
      <FilterPanel filters={filters} onFilterChange={handleFilterChange}
        onApply={() => { setPage(1); fetchTransfers(); }}
        onReset={() => { setFilters({ risk_level: "", network: "", direction: "", tx_hash: "", start_date: "", end_date: "" }); setPage(1); }} />
      <TransfersTable transfers={data?.transfers || []} />
      {data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{" "}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Page {page} of {data.pagination.totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= data.pagination.totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
