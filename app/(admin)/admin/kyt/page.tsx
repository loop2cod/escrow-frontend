"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  DollarSign,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface KytStats {
  totalTransfers: number;
  transfersToday: number;
  highRiskTransfers: number;
  severeRiskTransfers: number;
  activeAlerts: number;
  usersWithRisks: number;
}

interface RiskDistribution {
  none: number;
  low: number;
  medium: number;
  high: number;
  severe: number;
  undefined: number;
}

interface RecentTransfer {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  wallet: {
    id: string;
    network: string;
    address: string;
  } | null;
  txHash: string;
  network: string;
  direction: string;
  tokenSymbol: string | null;
  amount: number | null;
  fiatValue: number | null;
  riskLevel: string | null;
  riskScore: number | null;
  registeredAt: string;
}

interface KytDashboardData {
  stats: KytStats;
  riskDistribution: RiskDistribution;
  recentTransfers: RecentTransfer[];
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Shield className="h-4 w-4" />
      <span>/</span>
      <span className="text-foreground font-medium">KYT Dashboard</span>
    </nav>
  );
}

function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend,
  color,
  href,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeLabel?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  color?: string;
  href?: string;
}) {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : TrendingUp;

  const content = (
    <Card className="p-4 sm:p-5 border-0 shadow-lg bg-gradient-to-br from-card to-muted/20 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg ${color || "bg-muted"}`}>
            <Icon className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            {title}
          </span>
        </div>
      </div>
      <div className="mt-3 sm:mt-4">
        <span className="text-xl sm:text-2xl font-bold">{value}</span>
        {change && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${trendColors[trend || 'neutral']}`}>
            <TrendIcon className="h-3 w-3" />
            <span>{change}</span>
            {changeLabel && (
              <span className="text-muted-foreground ml-1">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function RiskDistributionCard({ distribution }: { distribution: RiskDistribution }) {
  const total = distribution.none + distribution.low + distribution.medium + 
                distribution.high + distribution.severe + distribution.undefined;

  const riskLevels = [
    { label: "None", value: distribution.none, color: "bg-emerald-500", textColor: "text-emerald-500" },
    { label: "Low", value: distribution.low, color: "bg-blue-500", textColor: "text-blue-500" },
    { label: "Medium", value: distribution.medium, color: "bg-amber-500", textColor: "text-amber-500" },
    { label: "High", value: distribution.high, color: "bg-orange-500", textColor: "text-orange-500" },
    { label: "Severe", value: distribution.severe, color: "bg-red-500", textColor: "text-red-500" },
    { label: "Undefined", value: distribution.undefined, color: "bg-slate-500", textColor: "text-slate-500" },
  ];

  return (
    <Card className="p-4 sm:p-5 border-0 shadow-lg">
      <div className="mb-4">
        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Risk Distribution
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Transfer risk levels</p>
      </div>

      <div className="space-y-3">
        {riskLevels.map((level) => (
          <div key={level.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${level.color}`} />
              <span className="text-sm">{level.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${level.textColor}`}>{level.value}</span>
              <span className="text-xs text-muted-foreground">
                ({total > 0 ? ((level.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Visual bar */}
      <div className="mt-4 h-3 rounded-full overflow-hidden flex">
        {riskLevels.map((level) => (
          <div
            key={level.label}
            className={`${level.color}`}
            style={{ width: `${total > 0 ? (level.value / total) * 100 : 0}%` }}
          />
        ))}
      </div>
    </Card>
  );
}

function RecentTransfersCard({ transfers }: { transfers: RecentTransfer[] }) {
  const getRiskColor = (riskLevel: string | null) => {
    switch (riskLevel) {
      case "none":
        return "bg-emerald-500/10 text-emerald-500";
      case "low":
        return "bg-blue-500/10 text-blue-500";
      case "medium":
        return "bg-amber-500/10 text-amber-500";
      case "high":
        return "bg-orange-500/10 text-orange-500";
      case "severe":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-slate-500/10 text-slate-500";
    }
  };

  const getRiskLabel = (riskLevel: string | null) => {
    return riskLevel || "undefined";
  };

  const formatAmount = (amount: number | null, symbol: string | null) => {
    if (amount === null) return "N/A";
    return `${amount.toLocaleString()} ${symbol || ""}`;
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  return (
    <Card className="p-4 sm:p-5 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm sm:text-base">Recent Transfers</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Latest monitored transfers</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-8" asChild>
          <Link href="/admin/kyt/transfers">View All</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {transfers.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Activity className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No transfers yet</p>
          </div>
        ) : (
          transfers.map((transfer) => (
            <div
              key={transfer.id}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">
                    {transfer.user?.name || "Unknown User"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {truncateHash(transfer.txHash)} • {transfer.network}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="font-medium text-xs sm:text-sm">
                  {formatAmount(transfer.amount, transfer.tokenSymbol)}
                </p>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getRiskColor(transfer.riskLevel)}`}>
                  {getRiskLabel(transfer.riskLevel)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function QuickActionsCard() {
  const actions = [
    { icon: Activity, label: "View Transfers", href: "/admin/kyt/transfers", color: "bg-blue-500" },
    { icon: AlertTriangle, label: "View Alerts", href: "/admin/kyt/alerts", color: "bg-amber-500" },
    { icon: Users, label: "User Risks", href: "/admin/users", color: "bg-purple-500" },
  ];

  return (
    <Card className="p-3 sm:p-4 border-0 shadow-lg">
      <div className="mb-4">
        <h3 className="font-semibold text-sm sm:text-base">Quick Actions</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">KYT management</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-2 sm:py-3 px-3 sm:px-4 justify-start gap-2 text-xs sm:text-sm"
            asChild
          >
            <Link href={action.href}>
              <div className={`h-6 w-6 rounded flex items-center justify-center ${action.color}`}>
                <action.icon className="h-3 w-3 text-white" />
              </div>
              <span className="truncate">{action.label}</span>
              <ArrowUpRight className="h-3 w-3 ml-auto" />
            </Link>
          </Button>
        ))}
      </div>
    </Card>
  );
}

export default function KytDashboard() {
  const [data, setData] = useState<KytDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/kyt/admin/dashboard");
      if (response.data.status && response.data.data) {
        setData(response.data.data);
        setLastUpdated(new Date());
      } else {
        setError(response.data.message || "Invalid response from server");
      }
    } catch (err: any) {
      console.error("Failed to fetch KYT dashboard:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load dashboard data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading KYT dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={handleRetry}>Retry</Button>
      </div>
    );
  }

  const stats = data?.stats || {
    totalTransfers: 0,
    transfersToday: 0,
    highRiskTransfers: 0,
    severeRiskTransfers: 0,
    activeAlerts: 0,
    usersWithRisks: 0,
  };

  const distribution = data?.riskDistribution || {
    none: 0,
    low: 0,
    medium: 0,
    high: 0,
    severe: 0,
    undefined: 0,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Breadcrumb />
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {format(lastUpdated, "hh:mm a")}
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={handleRetry} className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">KYT Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Monitor cryptocurrency transfers and risk assessments
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Transfers"
          value={stats.totalTransfers.toLocaleString()}
          icon={Activity}
          color="bg-blue-500"
          href="/admin/kyt/transfers"
        />
        <StatCard
          title="Today"
          value={stats.transfersToday.toLocaleString()}
          icon={Clock}
          color="bg-emerald-500"
          trend="up"
        />
        <StatCard
          title="High Risk"
          value={stats.highRiskTransfers.toLocaleString()}
          icon={AlertTriangle}
          color="bg-orange-500"
          trend={stats.highRiskTransfers > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Severe Risk"
          value={stats.severeRiskTransfers.toLocaleString()}
          icon={AlertCircle}
          color="bg-red-500"
          trend={stats.severeRiskTransfers > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Active Alerts"
          value={stats.activeAlerts.toLocaleString()}
          icon={AlertTriangle}
          color="bg-amber-500"
          href="/admin/kyt/alerts"
        />
        <StatCard
          title="Users w/ Risks"
          value={stats.usersWithRisks.toLocaleString()}
          icon={Users}
          color="bg-purple-500"
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <RiskDistributionCard distribution={distribution} />
        <RecentTransfersCard transfers={data?.recentTransfers || []} />
        <QuickActionsCard />
      </div>
    </div>
  );
}