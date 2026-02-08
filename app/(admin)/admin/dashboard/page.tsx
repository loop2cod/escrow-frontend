"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Shield,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  RefreshCw,
  Loader2,
  AlertCircle,
  UserCheck,
  UserCog,
  ArrowUpRight,
  Wallet,
  DollarSign,
  Activity,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Stats {
  totalUsers: number;
  buyers: number;
  sellers: number;
  admins: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalContracts: number;
  pendingContracts: number;
  activeContracts: number;
  completedContracts: number;
  disputedContracts: number;
  cancelledContracts: number;
  contractsThisWeek: number;
  contractsThisMonth: number;
  totalInEscrow: number;
  totalTransactionVolume: number;
  totalWallets: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RecentContract {
  id: string;
  title: string;
  status: string;
  totalAmount: number;
  currency: string;
  buyer: { id: string; name: string; email: string };
  seller: { id: string; name: string; email: string };
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
  user?: { id: string; name: string; email: string };
}

interface DashboardData {
  stats: Stats;
  recentUsers: RecentUser[];
  recentContracts: RecentContract[];
  recentActivity: Activity[];
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <LayoutDashboard className="h-4 w-4" />
      <span>/</span>
      <span className="text-foreground font-medium">Admin Dashboard</span>
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
        <Button variant="ghost" size="icon" className="h-7 sm:h-8 w-7 sm:w-8 hidden sm:flex">
          <MoreHorizontal className="h-3 sm:h-4 w-3 sm:w-4" />
        </Button>
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

function FinancialCard({ stats }: { stats: Stats }) {
  return (
    <Card className="p-4 sm:p-5 border-0 shadow-lg bg-gradient-to-br from-primary/10 via-card to-muted/20">
      <div className="mb-4">
        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Financial Overview
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Platform financial metrics</p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Transaction Volume</p>
          <p className="text-2xl sm:text-3xl font-bold">
            ${stats.totalTransactionVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-xs text-muted-foreground mb-1">In Escrow</p>
            <p className="text-lg font-bold text-amber-500">
              ${stats.totalInEscrow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-background/50">
            <p className="text-xs text-muted-foreground mb-1">Total Wallets</p>
            <p className="text-lg font-bold text-blue-500">{stats.totalWallets}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function QuickActionsCard() {
  const actions = [
    { icon: Users, label: "Manage Users", href: "/admin/users", color: "bg-blue-500" },
    { icon: ShoppingCart, label: "View Orders", href: "/admin/orders", color: "bg-emerald-500" },
    { icon: Activity, label: "Live Chat", href: "/admin/chat", color: "bg-purple-500" },
    { icon: Shield, label: "Admin Settings", href: "/admin/settings", color: "bg-slate-500" },
  ];

  return (
    <Card className="p-3 sm:p-4 border-0 shadow-lg">
      <div className="mb-4">
        <h3 className="font-semibold text-sm sm:text-base">Quick Actions</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Administrative tasks</p>
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
              <div className={`h-6 w-6 rounded flex items-center justify-center ${action.color}`}>
                <action.icon className="h-3 w-3 text-white" />
              </div>
              <span className="truncate">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </Card>
  );
}

function RecentUsersCard({ users }: { users: RecentUser[] }) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-500/10 text-purple-500";
      case "SELLER":
        return "bg-blue-500/10 text-blue-500";
      case "USER":
        return "bg-emerald-500/10 text-emerald-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "SELLER":
        return "Seller";
      case "USER":
        return "Buyer";
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-4 sm:p-5 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm sm:text-base">Recent Users</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Latest registered users</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-8" asChild>
          <Link href="/admin/users">View All</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Users className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No users yet</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{user.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2 flex flex-col items-end gap-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(user.createdAt), "MMM d")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function RecentContractsCard({ contracts }: { contracts: RecentContract[] }) {
  const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    DRAFT: { color: "bg-slate-500/10 text-slate-500", icon: Package, label: "Draft" },
    PENDING_ACCEPTANCE: { color: "bg-amber-500/10 text-amber-500", icon: Clock, label: "Pending" },
    PENDING_REVIEW: { color: "bg-amber-500/10 text-amber-500", icon: Clock, label: "Review" },
    AGREED: { color: "bg-blue-500/10 text-blue-500", icon: CheckCircle2, label: "Agreed" },
    PAYMENT_SUBMITTED: { color: "bg-emerald-500/10 text-emerald-500", icon: DollarSign, label: "Paid" },
    FUNDED: { color: "bg-emerald-500/10 text-emerald-500", icon: DollarSign, label: "Funded" },
    IN_PROGRESS: { color: "bg-blue-500/10 text-blue-500", icon: Activity, label: "In Progress" },
    DELIVERED: { color: "bg-purple-500/10 text-purple-500", icon: Package, label: "Delivered" },
    DELIVERY_REVIEWED: { color: "bg-purple-500/10 text-purple-500", icon: CheckCircle2, label: "Reviewed" },
    COMPLETED: { color: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle2, label: "Completed" },
    DISPUTED: { color: "bg-red-500/10 text-red-500", icon: AlertTriangle, label: "Disputed" },
    CANCELLED: { color: "bg-slate-500/10 text-slate-500", icon: XCircle, label: "Cancelled" },
    REJECTED: { color: "bg-red-500/10 text-red-500", icon: XCircle, label: "Rejected" },
  };

  return (
    <Card className="p-4 sm:p-5 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm sm:text-base">Recent Orders</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Latest contracts</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-8" asChild>
          <Link href="/admin/orders">View All</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {contracts.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <ShoppingCart className="h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          contracts.map((contract) => {
            const config = statusConfig[contract.status] || statusConfig.DRAFT;
            const StatusIcon = config.icon;
            return (
              <div
                key={contract.id}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{contract.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {contract.buyer.name} → {contract.seller.name}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="font-medium text-xs sm:text-sm">
                    ${Number(contract.totalAmount).toLocaleString()}
                  </p>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${config.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

function ActivityCard({ activities }: { activities: Activity[] }) {
  const typeIcons: Record<string, React.ElementType> = {
    login_success: CheckCircle2,
    login_failed: AlertCircle,
  };

  const typeColors: Record<string, string> = {
    login_success: "bg-emerald-500/10 text-emerald-500",
    login_failed: "bg-red-500/10 text-red-500",
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
          <p className="text-xs sm:text-sm text-muted-foreground">Platform actions</p>
        </div>
      </div>

      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-center py-3 text-muted-foreground text-sm">No recent activity</p>
        ) : (
          activities.slice(0, 5).map((activity) => {
            const Icon = typeIcons[activity.type] || Activity;
            return (
              <div
                key={activity.id}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50"
              >
                <div
                  className={`h-7 sm:h-8 w-7 sm:w-8 rounded-full flex items-center justify-center shrink-0 ${typeColors[activity.type] || "bg-muted text-muted-foreground"}`}
                >
                  <Icon className="h-3 sm:h-4 w-3 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs sm:text-sm font-medium truncate">
                      {activity.user?.name || "Unknown"}
                    </p>
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

function SystemStatusCard() {
  return (
    <Card className="p-4 sm:p-5 border-0 shadow-lg bg-gradient-to-br from-emerald-500/10 via-card to-muted/20">
      <div className="mb-4">
        <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-500" />
          System Status
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Platform health</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">API Server</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-500">Operational</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">Database</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-500">Operational</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">WebSocket</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-500">Operational</Badge>
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/admin/dashboard");
      if (response.data.status && response.data.data) {
        setData(response.data.data);
        setLastUpdated(new Date());
      } else {
        setError(response.data.message || "Invalid response from server");
      }
    } catch (err: any) {
      console.error("Failed to fetch admin dashboard:", err);
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
    totalUsers: 0,
    buyers: 0,
    sellers: 0,
    admins: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    totalContracts: 0,
    pendingContracts: 0,
    activeContracts: 0,
    completedContracts: 0,
    disputedContracts: 0,
    cancelledContracts: 0,
    contractsThisWeek: 0,
    contractsThisMonth: 0,
    totalInEscrow: 0,
    totalTransactionVolume: 0,
    totalWallets: 0,
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your platform and monitor activity
          </p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={`+${stats.newUsersThisWeek}`}
          changeLabel="this week"
          icon={Users}
          color="bg-blue-500"
          trend="up"
          href="/admin/users"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalContracts.toLocaleString()}
          change={`+${stats.contractsThisWeek}`}
          changeLabel="this week"
          icon={ShoppingCart}
          color="bg-emerald-500"
          trend="up"
          href="/admin/orders"
        />
        <StatCard
          title="Active Orders"
          value={stats.activeContracts.toLocaleString()}
          icon={Activity}
          color="bg-amber-500"
          trend="neutral"
        />
        <StatCard
          title="Completed"
          value={stats.completedContracts.toLocaleString()}
          icon={CheckCircle2}
          color="bg-purple-500"
          trend="up"
        />
      </div>

      {/* Financial & Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <FinancialCard stats={stats} />
        <QuickActionsCard />
        <SystemStatusCard />
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 sm:p-4 border-0 shadow-md bg-amber-500/5">
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          <p className="text-lg sm:text-xl font-bold text-amber-500">{stats.pendingContracts}</p>
        </Card>
        <Card className="p-3 sm:p-4 border-0 shadow-md bg-blue-500/5">
          <p className="text-xs text-muted-foreground mb-1">Active</p>
          <p className="text-lg sm:text-xl font-bold text-blue-500">{stats.activeContracts}</p>
        </Card>
        <Card className="p-3 sm:p-4 border-0 shadow-md bg-emerald-500/5">
          <p className="text-xs text-muted-foreground mb-1">Completed</p>
          <p className="text-lg sm:text-xl font-bold text-emerald-500">{stats.completedContracts}</p>
        </Card>
        <Card className="p-3 sm:p-4 border-0 shadow-md bg-red-500/5">
          <p className="text-xs text-muted-foreground mb-1">Disputed</p>
          <p className="text-lg sm:text-xl font-bold text-red-500">{stats.disputedContracts}</p>
        </Card>
        <Card className="p-3 sm:p-4 border-0 shadow-md bg-slate-500/5">
          <p className="text-xs text-muted-foreground mb-1">Cancelled</p>
          <p className="text-lg sm:text-xl font-bold text-slate-500">{stats.cancelledContracts}</p>
        </Card>
        <Card className="p-3 sm:p-4 border-0 shadow-md bg-purple-500/5">
          <p className="text-xs text-muted-foreground mb-1">In Escrow</p>
          <p className="text-lg sm:text-xl font-bold text-purple-500">
            ${(stats.totalInEscrow / 1000).toFixed(1)}k
          </p>
        </Card>
      </div>

      {/* User Breakdown Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Buyers"
          value={stats.buyers.toLocaleString()}
          icon={UserCheck}
          color="bg-emerald-500"
          trend="neutral"
        />
        <StatCard
          title="Sellers"
          value={stats.sellers.toLocaleString()}
          icon={UserCog}
          color="bg-amber-500"
          trend="neutral"
        />
        <StatCard
          title="Admins"
          value={stats.admins.toLocaleString()}
          icon={Shield}
          color="bg-purple-500"
          trend="neutral"
        />
        <StatCard
          title="Wallets"
          value={stats.totalWallets.toLocaleString()}
          icon={Wallet}
          color="bg-blue-500"
          trend="neutral"
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <RecentUsersCard users={data?.recentUsers || []} />
        <RecentContractsCard contracts={data?.recentContracts || []} />
        <ActivityCard activities={data?.recentActivity || []} />
      </div>
    </div>
  );
}
