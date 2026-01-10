"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/lib/store/settings-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  BookUser,
  TrendingUp,
  Fuel,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BankAccount, SavedAddress } from "@/lib/types";

export function WalletSettingsTab() {
  const {
    settings,
    fetchSettings,
    addBankAccount,
    removeBankAccount,
    setDefaultBankAccount,
    addSavedAddress,
    removeSavedAddress,
    isLoading,
  } = useSettingsStore();

  const [addBankOpen, setAddBankOpen] = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(false);

  // Bank form state
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">("checking");
  const [last4, setLast4] = useState("");

  // Address form state
  const [addressLabel, setAddressLabel] = useState("");
  const [addressValue, setAddressValue] = useState("");
  const [addressNote, setAddressNote] = useState("");
  const [network, setNetwork] = useState<"TRON" | "ETH" | "BTC">("TRON");

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleAddBank = async () => {
    await addBankAccount({
      bankName,
      accountType,
      last4,
      isDefault: false,
    });
    setBankName("");
    setLast4("");
    setAddBankOpen(false);
  };

  const handleAddAddress = async () => {
    await addSavedAddress({
      label: addressLabel,
      address: addressValue,
      network,
      note: addressNote,
    });
    setAddressLabel("");
    setAddressValue("");
    setAddressNote("");
    setAddAddressOpen(false);
  };

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Linked Bank Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Linked Bank Accounts
              </CardTitle>
              <CardDescription>
                Manage your linked bank accounts for USD deposits and withdrawals
              </CardDescription>
            </div>
            <Dialog open={addBankOpen} onOpenChange={setAddBankOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Bank Account</DialogTitle>
                  <DialogDescription>
                    Link a new bank account for deposits and withdrawals
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., Chase Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select value={accountType} onValueChange={(value: any) => setAccountType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last4">Last 4 Digits</Label>
                    <Input
                      id="last4"
                      value={last4}
                      onChange={(e) => setLast4(e.target.value)}
                      placeholder="1234"
                      maxLength={4}
                    />
                  </div>
                  <Button
                    onClick={handleAddBank}
                    disabled={isLoading || !bankName || !last4}
                    className="w-full"
                  >
                    Add Bank Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settings.walletSettings.linkedBankAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{account.bankName}</p>
                    {account.isDefault && (
                      <Badge variant="default" className="text-xs">
                        Default
                      </Badge>
                    )}
                    {account.verified && (
                      <Badge variant="outline" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {account.accountType} •••• {account.last4}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(account.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!account.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultBankAccount(account.id)}
                      disabled={isLoading}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBankAccount(account.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {settings.walletSettings.linkedBankAccounts.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No bank accounts linked yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Saved Addresses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookUser className="h-5 w-5" />
                Saved Addresses
              </CardTitle>
              <CardDescription>
                Save frequently used cryptocurrency addresses
              </CardDescription>
            </div>
            <Dialog open={addAddressOpen} onOpenChange={setAddAddressOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Saved Address</DialogTitle>
                  <DialogDescription>
                    Add a cryptocurrency address to your address book
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLabel">Label</Label>
                    <Input
                      id="addressLabel"
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                      placeholder="e.g., My Exchange"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="network">Network</Label>
                    <Select value={network} onValueChange={(value: any) => setNetwork(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRON">TRON (TRC20)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ERC20)</SelectItem>
                        <SelectItem value="BTC">Bitcoin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressValue">Address</Label>
                    <Input
                      id="addressValue"
                      value={addressValue}
                      onChange={(e) => setAddressValue(e.target.value)}
                      placeholder="TXyz..."
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressNote">Note (Optional)</Label>
                    <Input
                      id="addressNote"
                      value={addressNote}
                      onChange={(e) => setAddressNote(e.target.value)}
                      placeholder="Optional note"
                    />
                  </div>
                  <Button
                    onClick={handleAddAddress}
                    disabled={isLoading || !addressLabel || !addressValue}
                    className="w-full"
                  >
                    Save Address
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settings.walletSettings.savedAddresses.map((address) => (
              <div
                key={address.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{address.label}</p>
                    <Badge variant="outline" className="text-xs">
                      {address.network}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono truncate">
                    {address.address}
                  </p>
                  {address.note && (
                    <p className="text-xs text-muted-foreground">{address.note}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSavedAddress(address.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {settings.walletSettings.savedAddresses.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No saved addresses yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Withdrawal Limits
          </CardTitle>
          <CardDescription>Your current withdrawal limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Daily USD Limit</p>
                <p className="text-sm text-muted-foreground">Per 24 hours</p>
              </div>
              <p className="text-2xl font-bold">
                ${settings.walletSettings.withdrawalLimits.dailyUSD.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Daily USDT Limit</p>
                <p className="text-sm text-muted-foreground">Per 24 hours</p>
              </div>
              <p className="text-2xl font-bold">
                {settings.walletSettings.withdrawalLimits.dailyUSDT.toLocaleString()} USDT
              </p>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Per Transaction</p>
                <p className="text-sm text-muted-foreground">Single withdrawal</p>
              </div>
              <p className="text-2xl font-bold">
                ${settings.walletSettings.withdrawalLimits.perTransaction.toLocaleString()}
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Request Limit Increase
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gas Fee Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Gas Fee Preference
          </CardTitle>
          <CardDescription>
            Choose your preferred transaction speed for TRON transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={settings.walletSettings.gasFeePreference} disabled>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (Slower, cheaper)</SelectItem>
              <SelectItem value="medium">Medium (Recommended)</SelectItem>
              <SelectItem value="high">High (Faster, more expensive)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            Current setting: <span className="capitalize">{settings.walletSettings.gasFeePreference}</span>
          </p>
        </CardContent>
      </Card>

      {/* Auto-Convert Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Convert Settings</CardTitle>
          <CardDescription>
            Automatically convert USD to USDT when balance reaches a threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Auto-Convert</Label>
              <p className="text-sm text-muted-foreground">
                Automatically convert USD to USDT
              </p>
            </div>
            <Switch checked={settings.walletSettings.autoConvert.enabled} disabled />
          </div>
          {settings.walletSettings.autoConvert.enabled && (
            <div className="space-y-2">
              <Label>Threshold Amount (USD)</Label>
              <Input
                type="number"
                value={settings.walletSettings.autoConvert.threshold}
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                Convert to USDT when USD balance reaches this amount
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
