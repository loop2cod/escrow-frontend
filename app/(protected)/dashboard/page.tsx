"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Clock,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  CheckCircle2,
  Plus,
  Receipt,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import apiClient from "@/lib/api-client";
import Link from "next/link";
import { format } from "date-fns";

interface DashboardStats {
  totalBalance: number;
  totalInEscrow: number;
  activeContracts: number;
  pendingContracts: number;
  completedContracts: number;
  totalContracts: number;
}

interface Contract {
  id: string;
  title: string;
  status: string;
  totalAmount: number;
  currency: string;
  role: "buyer" | "seller";
  counterparty: { name: string; email: string };
  milestonesCount: number;
  completedMilestones: number;
  createdAt: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
}

interface DashboardData {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  stats: DashboardStats;
  wallets?: any[];
  recentContracts: Contract[];
  recentActivity: Activity[];
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <LayoutDashboard className="h-4 w-4" />
      <span>/</span>
      <span className="text-foreground font-medium">Dashboard</span>
    </nav>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
}) {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : TrendingUp;

  return (
    <Card className="p-4 sm:p-5 border-0 shadow-lg bg-gradient-to-br from-card to-muted/20">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            {title}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 sm:h-8 w-7 sm:w-8 hidden sm:flex">
          <MoreHorizontal className="h-3 sm:h-4 w-3 sm:w-4" />
        </Button>
      </div>
      <div className="mt-3 sm:mt-4 flex items-end justify-between">
        <span className="text-xl sm:text-2xl font-bold">{value}</span>
        {change && trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${trendColors[trend]}`}
          >
            <TrendIcon className="h-3 w-3" />
            {change}
          </div>
        )}
      </div>
    </Card>
  );
}

function WalletBalanceCard({ balance }: { balance: number }) {
  return (
    <Card className="p-4 sm:p-5 border-0 shadow-lg bg-gradient-to-br from-primary/10 via-card to-muted/20">
      <div className="mb-3 sm:mb-4">
        <h3 className="font-semibold text-sm sm:text-base">Total Balance</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Across all wallets</p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl sm:text-4xl font-bold">${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className="text-xs sm:text-sm text-muted-foreground">USDT</span>
      </div>

      <div className="mt-3 sm:mt-4 flex gap-2">
        <Button className="flex-1 text-xs sm:text-sm" size="sm" asChild>
          <Link href="/dashboard/wallet">
            <ArrowUpRight className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            Deposit
          </Link>
        </Button>
        <Button variant="outline" className="flex-1 text-xs sm:text-sm" size="sm" asChild>
          <Link href="/dashboard/wallet">
            <ArrowDownRight className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            Withdraw
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function EscrowCard({ amount }: { amount: number }) {
  return (
    <Card className="p-4 sm:p-5 border-0 shadow-lg bg-gradient-to-br from-emerald-500/10 via-card to-muted/20">
      <div className="mb-3 sm:mb-4">
        <h3 className="font-semibold text-sm sm:text-base">In Escrow</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Secured funds</p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl sm:text-4xl font-bold text-emerald-500">
          ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-xs sm:text-sm text-muted-foreground">USDT</span>
      </div>

      <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <CheckCircle2 className="h-3 sm:h-4 w-3 sm:w-4 text-emerald-500" />
        Protected by smart contracts
      </div>
    </Card>
  );
}

function OrdersCard({ contracts }: { contracts: Contract[] }) {
  const statusColors: Record<string, string> = {
    DRAFT: "bg-muted text-muted-foreground",
    PENDING_ACCEPTANCE: "bg-amber-500/10 text-amber-500",
    PENDING_REVIEW: "bg-amber-500/10 text-amber-500",
    AGREED: "bg-blue-500/10 text-blue-500",
    PAYMENT_SUBMITTED: "bg-emerald-500/10 text-emerald-500",
    FUNDED: "bg-emerald-500/10 text-emerald-500",
    IN_PROGRESS: "bg-blue-500/10 text-blue-500",
    DELIVERED: "bg-purple-500/10 text-purple-500",
    DELIVERY_REVIEWED: "bg-purple-500/10 text-purple-500",
    COMPLETED: "bg-emerald-500/10 text-emerald-500",
    DISPUTED: "bg-red-500/10 text-red-500",
    CANCELLED: "bg-muted text-muted-foreground",
    REJECTED: "bg-red-500/10 text-red-500",
  };

  const statusLabels: Record<string, string> = {
    DRAFT: "Draft",
    PENDING_ACCEPTANCE: "Pending",
    PENDING_REVIEW: "Review",
    AGREED: "Agreed",
    PAYMENT_SUBMITTED: "Payment Sent",
    FUNDED: "Funded",
    IN_PROGRESS: "In Progress",
    DELIVERED: "Delivered",
    DELIVERY_REVIEWED: "Reviewed",
    COMPLETED: "Completed",
    DISPUTED: "Disputed",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
  };

  const getCounterpartyDisplay = (contract: Contract) => {
    if (!contract.counterparty) return "Unknown";
    return contract.counterparty.name || contract.counterparty.email || "Unknown";
  };

  return (
    <Card className="p-4 sm:p-5 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm sm:text-base">Recent Orders</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Your latest contracts</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-8" asChild>
          <Link href="/dashboard/orders">View All</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {contracts.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Package className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No orders yet</p>
            <Button className="mt-4 text-xs sm:text-sm" size="sm" asChild>
              <Link href="/dashboard/orders/create">
                <Plus className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                Create First Order
              </Link>
            </Button>
          </div>
        ) : (
          contracts.slice(0, 3).map((contract) => (
            <div
              key={contract.id}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{contract.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {contract.role === "buyer" ? "Buying from" : "Selling to"}{" "}
                    {getCounterpartyDisplay(contract)}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="font-medium text-xs sm:text-sm">
                  ${Number(contract.totalAmount).toLocaleString()}
                </p>
                <Badge
                  variant="secondary"
                  className={`text-[10px] sm:text-xs ${statusColors[contract.status] || "bg-muted text-muted-foreground"}`}
                >
                  {statusLabels[contract.status] || contract.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>

      {contracts.length > 0 && (
        <Button className="w-full mt-4 text-xs sm:text-sm" size="sm" asChild>
          <Link href="/dashboard/orders/create">
            <Plus className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
            Create New Order
          </Link>
        </Button>
      )}
    </Card>
  );
}

function ActivityCard({ activities }: { activities: Activity[] }) {
  const typeIcons: Record<string, React.ElementType> = {
    contract_created: Plus,
    payment_received: ArrowDownRight,
    milestone_completed: CheckCircle2,
    login_success: CheckCircle2,
    login_failed: AlertCircle,
  };

  const typeColors: Record<string, string> = {
    contract_created: "bg-blue-500/10 text-blue-500",
    payment_received: "bg-emerald-500/10 text-emerald-500",
    milestone_completed: "bg-purple-500/10 text-purple-500",
    login_success: "bg-emerald-500/10 text-emerald-500",
    login_failed: "bg-red-500/10 text-red-500",
  };

  const typeLabels: Record<string, string> = {
    contract_created: "New Contract",
    payment_received: "Payment Received",
    milestone_completed: "Milestone Completed",
    login_success: "Login",
    login_failed: "Failed Login",
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-3 sm:p-4 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm sm:text-base">Recent Activity</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Your latest actions</p>
        </div>
      </div>

      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-center py-3 text-muted-foreground text-sm">No recent activity</p>
        ) : (
          activities.slice(0, 3).map((activity) => {
            const Icon = typeIcons[activity.type] || Receipt;
            const label = typeLabels[activity.type] || activity.type;
            return (
              <div
                key={activity.id}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50"
              >
                <div
                  className={`h-7 sm:h-8 w-7 sm:w-8 rounded-full flex items-center justify-center shrink-0 ${typeColors[activity.type] || "bg-muted text-muted-foreground"
                    }`}
                >
                  <Icon className="h-3 sm:h-4 w-3 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs sm:text-sm font-medium">{label}</p>
                    {activity.status === 'FAILED' && (
                      <Badge variant="destructive" className="text-[10px] h-4 px-1">
                        Failed
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/60">
                    {formatTimeAgo(activity.timestamp)}
                    {activity.ipAddress && ` • ${activity.ipAddress}`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

function QuickActionsCard() {
  const actions = [
    { icon: Plus, label: "New Order", href: "/dashboard/orders/create" },
    { icon: ArrowUpRight, label: "Deposit", href: "/dashboard/wallet" },
    { icon: Receipt, label: "Transactions", href: "/dashboard/wallet/transactions" },
    { icon: Users, label: "Profile", href: "/dashboard/settings" },
  ];

  return (
    <Card className="p-3 border-0 shadow-lg">
      <div className="mb-4">
        <h3 className="font-semibold text-sm sm:text-base">Quick Actions</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Frequently used actions</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-2 sm:py-3 px-3 sm:px-4 justify-start gap-2 text-xs sm:text-sm"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="h-3 sm:h-4 w-3 sm:w-4" />
              <span className="truncate">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/dashboard");
      console.log("Dashboard API response:", response.data);

      if (response.data.status && response.data.data) {
        const apiData = response.data.data;

        // Validate required fields
        if (!apiData.stats) {
          setError("Invalid dashboard data: missing stats");
          return;
        }

        setData({
          user: apiData.user,
          stats: {
            totalBalance: apiData.stats.totalBalance || 0,
            totalInEscrow: apiData.stats.totalInEscrow || 0,
            activeContracts: apiData.stats.activeContracts || 0,
            pendingContracts: apiData.stats.pendingContracts || 0,
            completedContracts: apiData.stats.completedContracts || 0,
            totalContracts: apiData.stats.totalContracts || 0,
          },
          wallets: apiData.wallets || [],
          recentContracts: apiData.recentContracts || [],
          recentActivity: apiData.recentActivity || [],
        });
        setLastUpdated(new Date());
      } else {
        setError(response.data.message || "Invalid response from server");
      }
    } catch (err: any) {
      console.error("Failed to fetch dashboard:", err);
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
        <p className="text-muted-foreground">Loading dashboard...</p>
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
    totalBalance: 0,
    totalInEscrow: 0,
    activeContracts: 0,
    pendingContracts: 0,
    completedContracts: 0,
    totalContracts: 0,
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Welcome to your escrow dashboard
          </p>
        </div>
      </div>


      {/* Balance & Escrow Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <WalletBalanceCard balance={stats.totalBalance} />
        <EscrowCard amount={stats.totalInEscrow} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Active Orders"
          value={stats.activeContracts}
          change="+2"
          icon={ShoppingCart}
          trend="up"
        />
        <StatCard
          title="Pending"
          value={stats.pendingContracts}
          icon={Clock}
          trend="neutral"
        />
        <StatCard
          title="Completed"
          value={stats.completedContracts}
          change="+8%"
          icon={CheckCircle2}
          trend="up"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalContracts}
          icon={Package}
          trend="neutral"
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <OrdersCard contracts={data?.recentContracts || []} />
        <QuickActionsCard />
        <ActivityCard activities={data?.recentActivity || []} />
      </div>
    </div>
  );
}
