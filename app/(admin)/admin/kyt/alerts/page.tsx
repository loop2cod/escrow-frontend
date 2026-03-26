"use client";

import { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  RefreshCw,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  User,
  Hash,
  Flame,
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

interface AlertsData {
  transfers: Transfer[];
  pagination: Pagination;
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Shield className="h-4 w-4" />
      <Link href="/admin/kyt" className="hover:text-foreground">KYT</Link>
      <span>/</span>
      <span className="text-foreground font-medium">Alerts</span>
    </nav>
  );
}

function RiskBadge({ riskLevel }: { riskLevel: string | null }) {
  const getRiskColor = (risk: string | null) => {
    switch (risk) {
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

function AlertsTable({ transfers }: { transfers: Transfer[] }) {
  const truncateHash = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  const formatAmount = (amount: number | null, symbol: string | null) =>
    amount === null ? "N/A" : `${amount.toLocaleString()} ${symbol || ""}`;
  const formatFiat = (value: number | null, currency: string) =>
    value === null ? "N/A" : `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  if (transfers.length === 0) {
    return (
      <Card className="p-8 border-0 shadow-lg text-center">
        <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No high-risk alerts found</p>
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
                      <Link href={`/admin/users/${transfer.userId}`} className="text-sm font-medium hover:text-primary hover:underline">
                        {transfer.user?.name || "Unknown"}
                      </Link>
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

export default function KytAlerts() {
  const [data, setData] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "severe">("all");

  const fetchAlerts = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");
      
      // Fetch high and severe risk transfers
      if (riskFilter === "all") {
        // We'll fetch both and combine
        const [highRes, severeRes] = await Promise.all([
          apiClient.get(`/kyt/admin/transfers?page=${page}&limit=20&risk_level=high`),
          apiClient.get(`/kyt/admin/transfers?page=${page}&limit=20&risk_level=severe`)
        ]);
        
        if (highRes.data.status && severeRes.data.status) {
          const highTransfers = highRes.data.data.transfers || [];
          const severeTransfers = severeRes.data.data.transfers || [];
          const allTransfers = [...severeTransfers, ...highTransfers].sort(
            (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
          );
          
          setData({
            transfers: allTransfers,
            pagination: {
              page,
              limit: 20,
              total: (highRes.data.data.pagination?.total || 0) + (severeRes.data.data.pagination?.total || 0),
              totalPages: Math.max(
                highRes.data.data.pagination?.totalPages || 1,
                severeRes.data.data.pagination?.totalPages || 1
              )
            }
          });
        } else {
          setError("Invalid response from server");
        }
      } else {
        params.append("risk_level", riskFilter);
        const response = await apiClient.get(`/kyt/admin/transfers?${params.toString()}`);
        if (response.data.status && response.data.data) {
          setData(response.data.data);
        } else {
          setError(response.data.message || "Invalid response from server");
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load alerts");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [page, riskFilter]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const highRiskCount = data?.transfers.filter(t => t.riskLevel === "high").length || 0;
  const severeRiskCount = data?.transfers.filter(t => t.riskLevel === "severe").length || 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => fetchAlerts()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Breadcrumb />
        <Button variant="ghost" size="sm" onClick={() => fetchAlerts()} className="gap-2">
          <RefreshCw className="h-4 w-4" />Refresh
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Flame className="h-8 w-8 text-orange-500" />
            High Risk Alerts
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Transfers flagged with high or severe risk level</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={riskFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => { setRiskFilter("all"); setPage(1); }}
          >
            All ({highRiskCount + severeRiskCount})
          </Button>
          <Button
            variant={riskFilter === "high" ? "default" : "outline"}
            size="sm"
            onClick={() => { setRiskFilter("high"); setPage(1); }}
            className="gap-1"
          >
            <AlertTriangle className="h-3 w-3" />
            High ({highRiskCount})
          </Button>
          <Button
            variant={riskFilter === "severe" ? "destructive" : "outline"}
            size="sm"
            onClick={() => { setRiskFilter("severe"); setPage(1); }}
            className="gap-1"
          >
            <Flame className="h-3 w-3" />
            Severe ({severeRiskCount})
          </Button>
        </div>
      </div>

      {data?.transfers.length === 0 ? (
        <Card className="p-8 border-0 shadow-lg text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No high-risk alerts found</p>
          <p className="text-sm text-muted-foreground mt-2">All transfers are currently at low or medium risk</p>
        </Card>
      ) : (
        <>
          <AlertsTable transfers={data?.transfers || []} />
          {data?.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{" "}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} alerts
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
        </>
      )}
    </div>
  );
}