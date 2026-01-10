"use client";

import { useWalletStore } from "@/lib/store/wallet-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Copy,
  CreditCard,
  DollarSign,
  ArrowLeftRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function USDAccountPage() {
  const { walletOverview, depositUSD, withdrawUSD, isLoading } = useWalletStore();
  const searchParams = useSearchParams();
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBankAccount, setWithdrawBankAccount] = useState("bank_001");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "deposit") {
      setDepositModalOpen(true);
    } else if (action === "withdraw") {
      setWithdrawModalOpen(true);
    }
  }, [searchParams]);

  const bridgeAccount = walletOverview?.bridgeAccount;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (amount && amount > 0) {
      await depositUSD(amount);
      setDepositAmount("");
      setDepositModalOpen(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (amount && amount > 0) {
      await withdrawUSD(amount, withdrawBankAccount);
      setWithdrawAmount("");
      setWithdrawModalOpen(false);
    }
  };

  if (!bridgeAccount) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">USD Account</h1>
        <p className="text-muted-foreground">Manage your Bridge USD account</p>
      </div>

      {/* Account Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Account Balance</span>
            <Badge
              variant={bridgeAccount.status === "active" ? "default" : "secondary"}
            >
              {bridgeAccount.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <DollarSign className="h-8 w-8 text-muted-foreground" />
            <span className="text-5xl font-bold">
              {bridgeAccount.balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-2xl text-muted-foreground">USD</span>
          </div>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>
              Available: $
              {bridgeAccount.availableBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
            <span>•</span>
            <span>
              Locked: $
              {(bridgeAccount.balance - bridgeAccount.availableBalance).toLocaleString(
                "en-US",
                { minimumFractionDigits: 2 }
              )}
            </span>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => setDepositModalOpen(true)} className="flex-1">
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Deposit
            </Button>
            <Button
              onClick={() => setWithdrawModalOpen(true)}
              variant="outline"
              className="flex-1"
            >
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Account Number</Label>
            <div className="flex items-center gap-2">
              <Input
                value={bridgeAccount.accountNumber}
                readOnly
                className="font-mono"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  copyToClipboard(bridgeAccount.accountNumber, "accountNumber")
                }
              >
                <Copy
                  className={`h-4 w-4 ${copiedField === "accountNumber" ? "text-green-600" : ""}`}
                />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Routing Number</Label>
            <div className="flex items-center gap-2">
              <Input
                value={bridgeAccount.routingNumber}
                readOnly
                className="font-mono"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  copyToClipboard(bridgeAccount.routingNumber, "routingNumber")
                }
              >
                <Copy
                  className={`h-4 w-4 ${copiedField === "routingNumber" ? "text-green-600" : ""}`}
                />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bridge Account ID</Label>
            <div className="flex items-center gap-2">
              <Input
                value={bridgeAccount.bridgeAccountId}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  copyToClipboard(bridgeAccount.bridgeAccountId, "bridgeId")
                }
              >
                <Copy
                  className={`h-4 w-4 ${copiedField === "bridgeId" ? "text-green-600" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Deposit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            How to Deposit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-1">ACH Transfer</h4>
            <p className="text-muted-foreground">
              Use your account and routing numbers to initiate an ACH transfer from
              your bank. Funds typically arrive within 1-3 business days.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Wire Transfer</h4>
            <p className="text-muted-foreground">
              Contact support for wire transfer instructions. Wire transfers are
              processed within 24 hours.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit USD</DialogTitle>
            <DialogDescription>
              Simulate a deposit to your USD account (for demo purposes)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Amount (USD)</Label>
              <Input
                id="depositAmount"
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <Button
              onClick={handleDeposit}
              disabled={isLoading || !depositAmount || parseFloat(depositAmount) <= 0}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Confirm Deposit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw USD</DialogTitle>
            <DialogDescription>
              Withdraw funds to your linked bank account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawAmount">Amount (USD)</Label>
              <Input
                id="withdrawAmount"
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Available: $
                {bridgeAccount.availableBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account</Label>
              <select
                id="bankAccount"
                value={withdrawBankAccount}
                onChange={(e) => setWithdrawBankAccount(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="bank_001">Bank Account ****1234</option>
                <option value="bank_002">Bank Account ****5678</option>
              </select>
            </div>
            <p className="text-sm text-muted-foreground">
              Processing fee: $2.50 • Est. arrival: 1-3 business days
            </p>
            <Button
              onClick={handleWithdraw}
              disabled={
                isLoading ||
                !withdrawAmount ||
                parseFloat(withdrawAmount) <= 0 ||
                parseFloat(withdrawAmount) > bridgeAccount.availableBalance
              }
              className="w-full"
            >
              {isLoading ? "Processing..." : "Confirm Withdrawal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
