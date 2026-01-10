"use client";

import { useWalletStore } from "@/lib/store/wallet-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpCircle,
  QrCode,
  Copy,
  Wallet,
  Fuel,
  ExternalLink,
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function USDTWalletPage() {
  const { walletOverview, sendUSDT, isLoading } = useWalletStore();
  const searchParams = useSearchParams();
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [sendAddress, setSendAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "send") {
      setSendModalOpen(true);
    } else if (action === "receive") {
      setReceiveModalOpen(true);
    }
  }, [searchParams]);

  const tronWallet = walletOverview?.tronWallet;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSend = async () => {
    const amount = parseFloat(sendAmount);
    if (amount && amount > 0 && sendAddress) {
      await sendUSDT(sendAddress, amount);
      setSendAmount("");
      setSendAddress("");
      setSendModalOpen(false);
    }
  };

  if (!tronWallet) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">USDT Wallet</h1>
        <p className="text-muted-foreground">
          Manage your TRON-based USDT wallet
        </p>
      </div>

      {/* Wallet Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Wallet Balance</span>
            <Badge
              variant={tronWallet.status === "active" ? "default" : "secondary"}
            >
              {tronWallet.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <Wallet className="h-8 w-8 text-muted-foreground" />
            <span className="text-5xl font-bold">
              {tronWallet.balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-2xl text-muted-foreground">USDT</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Fuel className="h-4 w-4" />
            <span>
              TRX Balance: {tronWallet.trxBalance.toFixed(2)} TRX (for gas fees)
            </span>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => setSendModalOpen(true)} className="flex-1">
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Send USDT
            </Button>
            <Button
              onClick={() => setReceiveModalOpen(true)}
              variant="outline"
              className="flex-1"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Receive
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Address */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>TRON Address</Label>
            <div className="flex items-center gap-2">
              <Input
                value={tronWallet.address}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(tronWallet.address, "address")}
              >
                <Copy
                  className={`h-4 w-4 ${copiedField === "address" ? "text-green-600" : ""}`}
                />
              </Button>
              <Button size="icon" variant="outline" asChild>
                <a
                  href={`https://tronscan.org/#/address/${tronWallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this address to receive USDT on the TRON network (TRC20)
            </p>
          </div>

          {tronWallet.trxBalance < 5 && (
            <Alert>
              <Fuel className="h-4 w-4" />
              <AlertDescription>
                Your TRX balance is low. You need TRX to pay for transaction fees
                (gas) when sending USDT. Consider adding more TRX to your wallet.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Network Information */}
      <Card>
        <CardHeader>
          <CardTitle>Network Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network</span>
            <span className="font-medium">TRON (TRC20)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token</span>
            <span className="font-medium">USDT (Tether)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Average Fee</span>
            <span className="font-medium">~1 USDT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Confirmation Time</span>
            <span className="font-medium">~1-3 minutes</span>
          </div>
        </CardContent>
      </Card>

      {/* Send USDT Modal */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send USDT</DialogTitle>
            <DialogDescription>
              Send USDT to another TRON address (TRC20)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sendAddress">Recipient Address</Label>
              <Input
                id="sendAddress"
                placeholder="TXyz..."
                value={sendAddress}
                onChange={(e) => setSendAddress(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Make sure this is a valid TRON (TRC20) address
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sendAmount">Amount (USDT)</Label>
              <Input
                id="sendAmount"
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Available: {tronWallet.balance.toFixed(2)} USDT
              </p>
            </div>
            <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span>{sendAmount || "0.00"} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span>~1.00 USDT</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {sendAmount
                    ? (parseFloat(sendAmount) + 1.0).toFixed(2)
                    : "0.00"}{" "}
                  USDT
                </span>
              </div>
            </div>
            <Alert>
              <AlertDescription className="text-xs">
                Transactions on the blockchain are irreversible. Please verify the
                recipient address carefully.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleSend}
              disabled={
                isLoading ||
                !sendAmount ||
                !sendAddress ||
                parseFloat(sendAmount) <= 0 ||
                parseFloat(sendAmount) > tronWallet.balance
              }
              className="w-full"
            >
              {isLoading ? "Processing..." : "Send USDT"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive USDT Modal */}
      <Dialog open={receiveModalOpen} onOpenChange={setReceiveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive USDT</DialogTitle>
            <DialogDescription>
              Share your wallet address to receive USDT
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg border-2">
                {/* QR Code placeholder */}
                <div className="w-64 h-64 bg-muted flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Your TRON Address (TRC20)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={tronWallet.address}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(tronWallet.address, "receiveAddress")
                  }
                >
                  <Copy
                    className={`h-4 w-4 ${copiedField === "receiveAddress" ? "text-green-600" : ""}`}
                  />
                </Button>
              </div>
            </div>
            <Alert>
              <AlertDescription className="text-xs">
                Only send USDT on the TRON network (TRC20) to this address. Sending
                other tokens or using a different network may result in loss of
                funds.
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
