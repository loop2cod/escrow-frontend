"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/lib/store/settings-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, User, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AccountTab() {
  const { settings, fetchSettings, updateProfile, isLoading } = useSettingsStore();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setFullName(settings.profile.fullName);
      setUsername(settings.profile.username);
      setPhone(settings.profile.phone || "");
    }
  }, [settings]);

  const handleSave = async () => {
    await updateProfile({
      fullName,
      username,
      phone,
    });
    setHasChanges(false);
  };

  const handleChange = () => {
    setHasChanges(true);
  };

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                handleChange();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                handleChange();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center gap-2">
              <Input id="email" value={settings.profile.email} readOnly disabled />
              {settings.profile.emailVerified ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex items-center gap-2">
              <Input
                id="phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  handleChange();
                }}
                placeholder="+1 (555) 123-4567"
              />
              {settings.profile.phoneVerified ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Verified
                </Badge>
              )}
            </div>
          </div>

          {hasChanges && (
            <Alert>
              <AlertDescription>You have unsaved changes</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            {hasChanges && (
              <Button
                variant="outline"
                onClick={() => {
                  setFullName(settings.profile.fullName);
                  setUsername(settings.profile.username);
                  setPhone(settings.profile.phone || "");
                  setHasChanges(false);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>View your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Account ID</Label>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {settings.profile.accountId}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Account Type</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {settings.profile.accountType}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Member Since</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(settings.profile.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Type Upgrade */}
      {settings.profile.accountType === "individual" && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Business Account</CardTitle>
            <CardDescription>
              Get access to business features and higher limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Higher transaction limits</li>
                <li>• Team member management</li>
                <li>• Advanced reporting</li>
                <li>• Priority support</li>
              </ul>
              <Button variant="outline">Upgrade Account</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Once you delete your account, there is no going back. All your data
                will be permanently deleted.
              </AlertDescription>
            </Alert>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
