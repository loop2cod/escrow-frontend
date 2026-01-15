"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet, Lock, TrendingUp, TrendingDown } from "lucide-react";
import { useWalletStore } from "@/lib/store/wallet-store";
import { useEffect } from "react";

export function WalletSummaryCards() {
  const { walletOverview, wallets, isLoading, fetchWalletOverview } = useWalletStore();

  useEffect(() => {
    fetchWalletOverview();
  }, [fetchWalletOverview]);

  if (isLoading || !walletOverview) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted rounded mb-2"></div>
              <div className="h-3 w-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { bridgeAccount, tronWallet, lockedFunds, totalBalance } = walletOverview;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Crypto Wallets (Iterate over fetched wallets) */}
      {wallets && wallets.length > 0 ? (
        wallets.map((wallet) => (
          <Card key={wallet.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {wallet.currency} Wallet ({wallet.network})
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parseFloat(wallet.balance.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {wallet.currency}
              </div>
              <div className="flex items-center mt-2">
                <span className="text-xs text-muted-foreground mr-2">
                  {wallet.address ? (
                    <>
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </>
                  ) : (
                    'Creating address...'
                  )}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${wallet.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {wallet.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        /* Fallback if no wallets fetched yet (e.g. before first fetch completes or if empty) */
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USDT Wallet (TRON)</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tronWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              TRX Balance: {tronWallet.trxBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TRX
            </p>
            <div className="flex items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {tronWallet.address.slice(0, 6)}...{tronWallet.address.slice(-4)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Locked Funds Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Locked in Escrow</CardTitle>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${lockedFunds.totalLocked.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {lockedFunds.activeOrders} Active {lockedFunds.activeOrders === 1 ? 'Order' : 'Orders'}
          </p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-orange-600">
              Funds held securely
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
