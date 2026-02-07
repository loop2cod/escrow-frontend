"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Copy, Check, Share2, Info, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import QRCode from "react-qr-code";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Wallet {
    id: string;
    currency: string;
    network: string;
    balance: string;
    address: string;
}

export default function ReceivePage() {
    const router = useRouter();
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedWalletId, setSelectedWalletId] = useState<string>("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await apiClient.get('/wallets');
                setWallets(res.data.data.wallets);
                if (res.data.data.wallets.length > 0) {
                    setSelectedWalletId(res.data.data.wallets[0].id);
                }
            } catch (err) {
                console.error('Failed to load wallets', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWallets();
    }, []);

    const selectedWallet = wallets.find(w => w.id === selectedWalletId);

    const getNetworkStandard = (network?: string) => {
        if (!network) return '';
        const n = network.toUpperCase();
        if (n.includes('TRON')) return 'TRC-20';
        if (n.includes('ETH')) return 'ERC-20';
        if (n.includes('SOL')) return 'SPL';
        return network;
    };

    const copyToClipboard = async () => {
        if (selectedWallet?.address) {
            try {
                await navigator.clipboard.writeText(selectedWallet.address);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy', err);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container space-y-4 animate-in slide-in-from-bottom-5 duration-500">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Receive Assets</h1>
                    <p className="text-sm text-muted-foreground">Top up your wallet</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
                {/* Main Card */}
                <Card className="shadow-md border-muted/60">
                    <CardHeader>
                        <CardTitle className="text-lg">Deposit Details</CardTitle>
                        <CardDescription>Select an asset to view your deposit address</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">

                        {/* Asset Select */}
                        <div className="space-y-2">
                            <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                                <SelectTrigger className="h-14 px-4 bg-muted/30">
                                    <SelectValue placeholder="Select asset" />
                                </SelectTrigger>
                                <SelectContent>
                                    {wallets.map(w => (
                                        <SelectItem key={w.id} value={w.id} className="cursor-pointer py-3">
                                            <div className="flex items-center justify-between w-full min-w-[200px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-semibold">{w.currency}</div>
                                                    <Badge variant="outline" className="text-[10px] h-5">{getNetworkStandard(w.network)}</Badge>
                                                </div>
                                                <div className="text-muted-foreground text-xs">
                                                    Bal: {parseFloat(w.balance).toLocaleString()}
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* QR Code Container */}
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-border/50">
                                {selectedWallet && (
                                    <QRCode
                                        value={selectedWallet.address}
                                        size={180}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                    />
                                )}
                            </div>

                            <div className="w-full space-y-2">
                                <label className="text-xs font-medium text-muted-foreground ml-1">Wallet Address</label>
                                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <code className="flex-1 text-sm font-mono break-all text-foreground/80">
                                        {selectedWallet?.address}
                                    </code>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 hover:bg-background" onClick={copyToClipboard}>
                                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex justify-center">
                            <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={() => {
                                if (navigator.share && selectedWallet) {
                                    navigator.share({
                                        title: 'My Wallet Address',
                                        text: `Here is my ${selectedWallet.currency} (${getNetworkStandard(selectedWallet.network)}) address:\n${selectedWallet.address}`,
                                    }).catch(console.error);
                                } else {
                                    copyToClipboard();
                                }
                            }}>
                                <Share2 className="h-4 w-4" /> Share Address Details
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                {/* Sidebar Info & FAQ */}
                <div className="space-y-6">
                    <Card className="bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-900/30 shadow-none">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                                <Info className="h-4 w-4" />
                                <span className="text-sm font-semibold">Important Warning</span>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs text-yellow-800 dark:text-yellow-400 space-y-2">
                            <p>• Send only <strong>{selectedWallet?.currency} ({getNetworkStandard(selectedWallet?.network)})</strong> to this address.</p>
                            <p>• Sending any other coin or token to this address may result in the loss of your deposit.</p>
                            <p>• Coins will be deposited after <strong>1 network confirmation</strong>.</p>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <HelpCircle className="h-4 w-4" /> FAQ
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-sm">What is the minimum deposit?</AccordionTrigger>
                                <AccordionContent className="text-xs text-muted-foreground">
                                    There is a minimum deposit amount of 1 USDT for most assets. However, make sure the amount covers any sender-side fees.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-sm">How long does it take?</AccordionTrigger>
                                <AccordionContent className="text-xs text-muted-foreground">
                                    Deposits generally arrive within 1-3 minutes after network confirmation. TRON and Solana are usually instantaneous.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-sm">Can I send from an exchange?</AccordionTrigger>
                                <AccordionContent className="text-xs text-muted-foreground">
                                    Yes, you can send funds from any exchange (Binance, CoinSwitch, etc.). Just ensure you select the matching network ({getNetworkStandard(selectedWallet?.network)}).
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    );
}
