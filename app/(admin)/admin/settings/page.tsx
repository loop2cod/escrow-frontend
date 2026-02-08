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
  Settings,
  User,
  Shield,
  Activity,
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  useEffect(() => {
    fetchProfile();
    fetchActivities(1, statusFilter);
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
    // Validation
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
            Manage your admin account and view login activity
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
              Unsaved Changes
            </Badge>
          </div>
        )}
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-fit">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Login Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Info Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
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
                    <AlertDescription>
                      You have unsaved changes. Don&apos;t forget to save.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button onClick={handleSaveProfile} disabled={!hasChanges || saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  {hasChanges && (
                    <Button variant="outline" onClick={handleReset}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                  View your account information
                </CardDescription>
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
                    <Label className="text-muted-foreground text-xs">Role</Label>
                    <div>
                      <Badge variant="default" className="bg-purple-500/10 text-purple-500">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Administrator
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <div>
                      <Badge
                        variant={profile?.status === "ACTIVE" ? "default" : "secondary"}
                        className={
                          profile?.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : ""
                        }
                      >
                        {profile?.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Member Since</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {profile?.createdAt &&
                        format(new Date(profile.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Last Updated</Label>
                    <div className="text-sm">
                      {profile?.updatedAt &&
                        format(new Date(profile.updatedAt), "MMM d, yyyy HH:mm")}
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
            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
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
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    changingPassword
                  }
                  className="w-full"
                >
                  {changingPassword ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Change Password
                </Button>
              </CardContent>
            </Card>

            {/* 2FA Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Manage your 2FA settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${profile?.twoFactorEnabled
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-slate-500/10 text-slate-500"
                        }`}
                    >
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {profile?.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.twoFactorEnabled
                          ? "Your account is protected with 2FA"
                          : "Enable 2FA for additional security"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={profile?.twoFactorEnabled ? "default" : "secondary"}
                    className={
                      profile?.twoFactorEnabled
                        ? "bg-emerald-500/10 text-emerald-500"
                        : ""
                    }
                  >
                    {profile?.twoFactorEnabled ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {profile?.twoFactorEnabled && profile?.twoFactorMethod && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Method</Label>
                    <p className="text-sm capitalize">{profile.twoFactorMethod}</p>
                  </div>
                )}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication settings can be managed from your main dashboard
                    settings.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Login Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Login Activity
                  </CardTitle>
                  <CardDescription>
                    View your recent login history and account access
                  </CardDescription>
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
                      <div className="hidden sm:block sm:col-span-2">Device</div>
                      <div className="col-span-5 sm:col-span-2 text-right">Time</div>
                    </div>
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="grid grid-cols-12 gap-4 p-4 border-t items-center text-sm"
                      >
                        <div className="col-span-3 sm:col-span-2">
                          {getStatusBadge(activity.status)}
                        </div>
                        <div className="col-span-4 sm:col-span-3 font-mono text-xs">
                          {activity.ipAddress || "Unknown"}
                        </div>
                        <div className="hidden sm:block sm:col-span-3 text-muted-foreground">
                          {activity.location || "Unknown"}
                        </div>
                        <div className="hidden sm:block sm:col-span-2 text-muted-foreground truncate">
                          {activity.userAgent
                            ? activity.userAgent.split(" ")[0]
                            : "Unknown"}
                        </div>
                        <div className="col-span-5 sm:col-span-2 text-right text-muted-foreground">
                          {format(new Date(activity.timestamp), "MMM d, HH:mm")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                        {pagination.total} activities
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1 || activitiesLoading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={
                            pagination.page === pagination.totalPages || activitiesLoading
                          }
                        >
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
    </div>
  );
}
