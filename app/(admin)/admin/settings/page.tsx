"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import {
  Settings,
  User,
  Shield,
  Activity,
  Wallet,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Calendar,
  ShieldCheck,
  Smartphone,
  Mail,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Plus,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Coins,
  ChevronDown,
  RotateCw,
  List,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string | null;
  role: string;
  status: string;
  userReferenceId: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LoginActivity {
  id: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  timestamp: string;
}

interface Asset {
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceRaw: string;
  contractAddress: string | null;
  chain: string;
}

interface WalletData {
  id: string;
  network: string;
  address: string;
  currency: string;
  balance?: string;
  dfnsWalletId?: string;
  createdAt: string;
  assets: Asset[];
  totalAssets: number;
  refreshedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Settings className="h-4 w-4" />
      <span>/</span>
      <span className="text-foreground font-medium">Admin Settings</span>
    </nav>
  );
}

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { toast } = useToast();

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Login activities state
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Wallet state
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [refreshingWallet, setRefreshingWallet] = useState<string | null>(null);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [expandedAssets, setExpandedAssets] = useState<string | null>(null);

  // Transfer state
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferToAddress, setTransferToAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [transferring, setTransferring] = useState(false);



  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/profile");
      if (response.data.status && response.data.data.profile) {
        const profileData = response.data.data.profile;
        setProfile(profileData);
        setFullName(profileData.name);
        setUsername(profileData.username || "");
        setPhone(profileData.phone || "");
      }
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to load profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (page: number = 1, status: string = "all") => {
    try {
      setActivitiesLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (status !== "all") params.append("status", status);

      const response = await apiClient.get(`/admin/activities?${params.toString()}`);
      if (response.data.status && response.data.data) {
        setActivities(response.data.data.activities);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      console.error("Failed to fetch activities:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to load login activities",
      });
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      setWalletsLoading(true);
      const response = await apiClient.get("/admin/wallets");
      if (response.data.status && response.data.data.wallets) {
        setWallets(response.data.data.wallets);
      }
    } catch (error: any) {
      console.error("Failed to fetch wallets:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to load wallets",
      });
    } finally {
      setWalletsLoading(false);
    }
  };

  const refreshWallet = async (walletId: string) => {
    try {
      setRefreshingWallet(walletId);
      const response = await apiClient.get(`/admin/wallets/${walletId}/refresh`);
      if (response.data.status && response.data.data.wallet) {
        const updatedWallet = response.data.data.wallet;
        setWallets((prev) =>
          prev.map((w) => (w.id === walletId ? updatedWallet : w))
        );
        toast({
          title: "Success",
          description: "Wallet balance refreshed",
        });
      }
    } catch (error: any) {
      console.error("Failed to refresh wallet:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to refresh balance",
      });
    } finally {
      setRefreshingWallet(null);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchActivities(1, statusFilter);
    fetchWallets();
  }, []);

  useEffect(() => {
    if (profile) {
      const changed =
        fullName !== profile.name ||
        username !== (profile.username || "") ||
        phone !== (profile.phone || "");
      setHasChanges(changed);
    }
  }, [fullName, username, phone, profile]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await apiClient.patch("/admin/profile", {
        name: fullName,
        username: username || undefined,
        phone: phone || undefined,
      });
      if (response.data.status) {
        setProfile(response.data.data.profile);
        setHasChanges(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All password fields are required",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New password must be at least 6 characters",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match",
      });
      return;
    }

    try {
      setChangingPassword(true);
      const response = await apiClient.post("/admin/change-password", {
        currentPassword,
        newPassword,
      });
      if (response.data.status) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
      }
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to change password",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFullName(profile.name);
      setUsername(profile.username || "");
      setPhone(profile.phone || "");
    }
    setHasChanges(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchActivities(newPage, statusFilter);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    fetchActivities(1, value);
  };

  const handleCreateTrxWallet = async () => {
    try {
      setCreatingWallet(true);
      const response = await apiClient.post("/admin/wallets/trx");
      if (response.data.status) {
        toast({
          title: "Success",
          description: "TRX wallet created successfully",
        });
        fetchWallets();
      }
    } catch (error: any) {
      console.error("Failed to create wallet:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to create wallet",
      });
    } finally {
      setCreatingWallet(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedWallet || !selectedAsset) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No wallet or asset selected",
      });
      return;
    }

    if (!transferToAddress || !transferAmount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Recipient address and amount are required",
      });
      return;
    }

    const amountNum = parseFloat(transferAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid amount",
      });
      return;
    }

    const assetBalance = parseFloat(selectedAsset.balance);
    if (assetBalance < amountNum) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Insufficient ${selectedAsset.symbol} balance. Available: ${selectedAsset.balance}`,
      });
      return;
    }

    try {
      setTransferring(true);
      const response = await apiClient.post("/admin/wallets/transfer", {
        walletId: selectedWallet.id,
        toAddress: transferToAddress,
        amount: transferAmount,
        assetSymbol: selectedAsset.symbol,
        contractAddress: selectedAsset.contractAddress,
      });
      if (response.data.status) {
        toast({
          title: "Success",
          description: `${selectedAsset.symbol} transfer initiated. Transaction ID: ${response.data.data.txId}`,
        });
        setTransferDialogOpen(false);
        setTransferToAddress("");
        setTransferAmount("");
        setSelectedAsset(null);
        fetchWallets();
      }
    } catch (error: any) {
      console.error("Failed to transfer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Transfer failed",
      });
    } finally {
      setTransferring(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const openTransferDialog = (wallet: WalletData, asset: Asset) => {
    setSelectedWallet(wallet);
    setSelectedAsset(asset);
    setTransferDialogOpen(true);
  };



  const toggleAssetsExpand = (walletId: string) => {
    setExpandedAssets(expandedAssets === walletId ? null : walletId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  const hasTrxWallet = wallets.some((w) => w.network === "TRON");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Breadcrumb />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProfile} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your admin account, wallet, and view login activity
          </p>
        </div>
        {hasChanges && (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
            Unsaved Changes
          </Badge>
        )}
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Wallet</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address
                  </Label>
                  <Input id="email" value={profile?.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Smartphone className="h-4 w-4 inline mr-1" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {hasChanges && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>You have unsaved changes</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center gap-2">
                  <Button onClick={handleSaveProfile} disabled={!hasChanges || saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                  {hasChanges && <Button variant="outline" onClick={handleReset}>Cancel</Button>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {profile?.name ? getInitials(profile.name) : "AD"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Account ID</Label>
                    <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                      {profile?.userReferenceId}
                    </code>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Role</Label>
                    <Badge className="bg-purple-500/10 text-purple-500">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Administrator
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <Badge className={profile?.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : ""}>
                      {profile?.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Member Since</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {profile?.createdAt && format(new Date(profile.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={!currentPassword || !newPassword || !confirmPassword || changingPassword}
                  className="w-full"
                >
                  {changingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${profile?.twoFactorEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"}`}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{profile?.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.twoFactorEnabled ? "Your account is protected" : "Enable 2FA for security"}
                      </p>
                    </div>
                  </div>
                  <Badge className={profile?.twoFactorEnabled ? "bg-emerald-500/10 text-emerald-500" : ""}>
                    {profile?.twoFactorEnabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Wallet Tab - Enhanced */}
        <TabsContent value="wallet" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Wallets</h2>
              <p className="text-sm text-muted-foreground">Manage your crypto assets and transactions</p>
            </div>
            {!hasTrxWallet && (
              <Button onClick={handleCreateTrxWallet} disabled={creatingWallet}>
                {creatingWallet ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Create TRX Wallet
              </Button>
            )}
          </div>

          {walletsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading wallets...</p>
            </div>
          ) : wallets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No wallets found</p>
                <Button onClick={handleCreateTrxWallet} disabled={creatingWallet}>
                  {creatingWallet ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create TRX Wallet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {wallets.map((wallet) => (
                <Card key={wallet.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Wallet className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{wallet.network}</CardTitle>
                            <Badge variant="outline">{wallet.currency}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-muted px-2 py-0.5 rounded">
                              {wallet.address.slice(0, 16)}...{wallet.address.slice(-8)}
                            </code>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(wallet.address)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{parseFloat(wallet.balance || "0").toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">USDT</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Assets Section */}
                    <Collapsible open={expandedAssets === wallet.id} onOpenChange={() => toggleAssetsExpand(wallet.id)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full flex items-center justify-between p-2 h-auto">
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4" />
                            <span className="font-medium">Assets ({wallet.totalAssets || 0})</span>
                          </div>
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedAssets === wallet.id ? "rotate-180" : ""}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-2 pt-2">
                          {wallet.assets && wallet.assets.length > 0 ? (
                            wallet.assets.map((asset) => (
                              <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                    {asset.symbol.slice(0, 2)}
                                  </div>
                                  <div>
                                    <p className="font-medium">{asset.name}</p>
                                    <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="font-medium">{parseFloat(asset.balance).toFixed(6)}</p>
                                    <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openTransferDialog(wallet, asset)}
                                    disabled={parseFloat(asset.balance) <= 0}
                                  >
                                    <Send className="h-3 w-3 mr-1" />
                                    Send
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No assets found</p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshWallet(wallet.id)}
                        disabled={refreshingWallet === wallet.id}
                      >
                        {refreshingWallet === wallet.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RotateCw className="h-4 w-4 mr-2" />
                        )}
                        Refresh
                      </Button>
                      <Link href={`/admin/wallet/transactions?walletId=${wallet.id}`}>
                        <Button variant="outline" size="sm">
                          <List className="h-4 w-4 mr-2" />
                          Transactions
                        </Button>
                      </Link>
                      {wallet.refreshedAt && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          Updated {format(new Date(wallet.refreshedAt), "HH:mm")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Login Activity
                  </CardTitle>
                  <CardDescription>View your recent login history</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="SUCCESS">Successful</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading activities...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No login activities found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-muted text-sm font-medium">
                      <div className="col-span-3 sm:col-span-2">Status</div>
                      <div className="col-span-4 sm:col-span-3">IP Address</div>
                      <div className="hidden sm:block sm:col-span-3">Location</div>
                      <div className="col-span-5 sm:col-span-4 text-right">Time</div>
                    </div>
                    {activities.map((activity) => (
                      <div key={activity.id} className="grid grid-cols-12 gap-4 p-4 border-t items-center text-sm">
                        <div className="col-span-3 sm:col-span-2">{getStatusBadge(activity.status)}</div>
                        <div className="col-span-4 sm:col-span-3 font-mono text-xs">{activity.ipAddress || "Unknown"}</div>
                        <div className="hidden sm:block sm:col-span-3 text-muted-foreground">{activity.location || "Unknown"}</div>
                        <div className="col-span-5 sm:col-span-4 text-right text-muted-foreground">
                          {format(new Date(activity.timestamp), "MMM d, HH:mm")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1 || activitiesLoading}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">Page {pagination.page} of {pagination.totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages || activitiesLoading}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer Dialog - Multi Asset */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send {selectedAsset?.symbol}</DialogTitle>
            <DialogDescription>
              Transfer {selectedAsset?.name} from your {selectedWallet?.network} wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>From</Label>
              <div className="p-3 rounded-lg bg-muted text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedWallet?.network}</span>
                  <span>{parseFloat(selectedAsset?.balance || "0").toFixed(6)} {selectedAsset?.symbol}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toAddress">Recipient Address</Label>
              <Input
                id="toAddress"
                value={transferToAddress}
                onChange={(e) => setTransferToAddress(e.target.value)}
                placeholder={`Enter ${selectedAsset?.symbol} address`}
              />
              {selectedWallet?.network === "TRON" && (
                <p className="text-xs text-muted-foreground">TRON addresses start with &quot;T&quot;</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                step="0.000001"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Available: {parseFloat(selectedAsset?.balance || "0").toFixed(6)} {selectedAsset?.symbol}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-0 px-2"
                  onClick={() => setTransferAmount(selectedAsset?.balance || "0")}
                >
                  Max
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleTransfer}
              disabled={!transferToAddress || !transferAmount || transferring}
            >
              {transferring ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Send {selectedAsset?.symbol}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
}
