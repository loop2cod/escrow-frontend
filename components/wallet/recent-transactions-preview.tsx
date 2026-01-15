"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { ArrowUpRight, ArrowDownLeft, Clock, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Transaction {
    id: string;
    network: string;
    currency: string;
    status: string;
    kind: string;
    dateCreated: string;
    amount?: string;
    fee?: string;
    direction?: string;
    hash?: string;
}

// Explorer URL Helper (Duplicated for now, ideally shared util)
const getExplorerLink = (network: string, hash: string) => {
    if (!hash) return '#';
    const net = network.toLowerCase();

    if (net.includes('tron')) return `https://nile.tronscan.org/#/transaction/${hash}`;
    if (net.includes('eth')) return `https://sepolia.etherscan.io/tx/${hash}`;
    if (net.includes('sol')) return `https://explorer.solana.com/tx/${hash}?cluster=devnet`;
    if (net.includes('bitcoin')) return `https://mempool.space/testnet/tx/${hash}`;
    return '#';
};

export function RecentTransactionsPreview() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const response = await apiClient.get('/wallets/transactions');
                // Take top 5
                setTransactions(response.data.data.transactions.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch recent transactions", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecent();
    }, []);

    if (isLoading) return <div className="flex flex-col items-center justify-center py-12 text-secondary-foreground text-sm">
        <Loader2 className="h-9 w-9 animate-spin" />
    </div>;

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                <Clock className="h-8 w-8 mb-2 opacity-20" />
                No recent transactions
            </div>
        );
    }

    return (
        <div className="divide-y">
            {transactions.map((tx: any) => {
                const isIncoming = tx.direction === 'in' || tx.direction === 'incoming';
                const explorerLink = getExplorerLink(tx.network, tx.hash || '');

                return (
                    <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center ${isIncoming ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {isIncoming ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                            </div>
                            <div>
                                <div className="font-medium text-sm capitalize">{isIncoming ? 'Receive' : 'Send'}</div>
                                <div className="text-[10px] text-muted-foreground capitalize">
                                    {tx.kind?.replace(/([A-Z])/g, ' $1').trim() || 'Transfer'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(tx.dateCreated).toLocaleDateString("en-US", {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: true
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Middle Section: Fee & Hash (Only show hash link, space constraints) */}
                        <div className="hidden sm:flex flex-col items-end text-right mr-4 flex-1">
                            <span className="text-xs font-mono text-muted-foreground">
                                {tx.hash ? (
                                    <a
                                        href={explorerLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-primary transition-colors"
                                    >
                                        {tx.hash.substring(0, 6)}... <ExternalLink className="h-3 w-3" />
                                    </a>
                                ) : '-'}
                            </span>
                            {!isIncoming && tx.fee && <span className="text-[10px] text-muted-foreground">Fee: {tx.fee}</span>}
                        </div>

                        <div className="text-right">
                            <div className={`font-medium text-sm ${isIncoming ? 'text-green-600' : 'text-foreground'}`}>
                                {isIncoming ? '+' : '-'}{parseFloat(tx.amount || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {tx.currency}
                            </div>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">{tx.status}</Badge>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
