"use client";

import { WalletSummaryCards } from "@/components/wallet/wallet-summary-cards";
import { RecentActivity } from "@/components/wallet/recent-activity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, QrCode } from "lucide-react";
import Link from "next/link";

export default function WalletPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your USD account and USDT wallet
          </p>
        </div>
      </div>

      {/* Wallet Balances */}
      <WalletSummaryCards />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/wallet/usd-account?action=deposit">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <ArrowDownCircle className="h-6 w-6 text-green-600" />
                <span>Deposit USD</span>
              </Button>
            </Link>

            <Link href="/dashboard/wallet/usd-account?action=withdraw">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <ArrowUpCircle className="h-6 w-6 text-blue-600" />
                <span>Withdraw USD</span>
              </Button>
            </Link>

            <Link href="/dashboard/wallet/usdt-wallet?action=send">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <ArrowUpCircle className="h-6 w-6 text-purple-600" />
                <span>Send USDT</span>
              </Button>
            </Link>

            <Link href="/dashboard/wallet/usdt-wallet?action=receive">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <QrCode className="h-6 w-6 text-orange-600" />
                <span>Receive USDT</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Account Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/wallet/usd-account">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">USD Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage your USD account, view details, deposit, and withdraw funds
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/wallet/usdt-wallet">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">USDT Wallet (TRON)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage your TRON-based USDT wallet, send and receive cryptocurrency
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
