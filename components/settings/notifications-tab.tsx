"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/store/settings-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, Smartphone, Radio } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function NotificationsTab() {
  const { settings, fetchSettings, updateNotifications } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = (channel: 'email' | 'sms' | 'push', category: 'transactions' | 'orders' | 'security' | 'marketing', value: boolean) => {
    if (!settings) return;
    updateNotifications({
      [channel]: {
        ...settings.notifications[channel],
        [category]: value,
      },
    });
  };

  const handleFrequencyChange = (frequency: 'realtime' | 'daily' | 'weekly') => {
    updateNotifications({ frequency });
  };

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Manage your email notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Transaction Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Deposits, withdrawals, and transfers
              </p>
            </div>
            <Switch
              checked={settings.notifications.email.transactions}
              onCheckedChange={(value) => handleToggle('email', 'transactions', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Order Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Order status updates and milestones
              </p>
            </div>
            <Switch
              checked={settings.notifications.email.orders}
              onCheckedChange={(value) => handleToggle('email', 'orders', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Login alerts and security events
              </p>
            </div>
            <Switch
              checked={settings.notifications.email.security}
              onCheckedChange={(value) => handleToggle('email', 'security', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Product updates and promotions
              </p>
            </div>
            <Switch
              checked={settings.notifications.email.marketing}
              onCheckedChange={(value) => handleToggle('email', 'marketing', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>Manage your SMS notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Transaction Notifications</Label>
              <p className="text-sm text-muted-foreground">
                High-value transactions only
              </p>
            </div>
            <Switch
              checked={settings.notifications.sms.transactions}
              onCheckedChange={(value) => handleToggle('sms', 'transactions', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Order Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Critical order updates
              </p>
            </div>
            <Switch
              checked={settings.notifications.sms.orders}
              onCheckedChange={(value) => handleToggle('sms', 'orders', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Security alerts and 2FA codes
              </p>
            </div>
            <Switch
              checked={settings.notifications.sms.security}
              onCheckedChange={(value) => handleToggle('sms', 'security', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Manage your browser push notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Transaction Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Real-time transaction alerts
              </p>
            </div>
            <Switch
              checked={settings.notifications.push.transactions}
              onCheckedChange={(value) => handleToggle('push', 'transactions', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Order Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Order status changes
              </p>
            </div>
            <Switch
              checked={settings.notifications.push.orders}
              onCheckedChange={(value) => handleToggle('push', 'orders', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Immediate security alerts
              </p>
            </div>
            <Switch
              checked={settings.notifications.push.security}
              onCheckedChange={(value) => handleToggle('push', 'security', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Notification Frequency
          </CardTitle>
          <CardDescription>Choose how often you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={settings.notifications.frequency} onValueChange={handleFrequencyChange}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="realtime" id="realtime" />
              <Label htmlFor="realtime" className="flex-1 cursor-pointer">
                <div className="font-medium">Real-time</div>
                <div className="text-sm text-muted-foreground">
                  Receive notifications as events happen
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily" className="flex-1 cursor-pointer">
                <div className="font-medium">Daily Digest</div>
                <div className="text-sm text-muted-foreground">
                  Receive a summary once per day
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                <div className="font-medium">Weekly Summary</div>
                <div className="text-sm text-muted-foreground">
                  Receive a summary once per week
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
