"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Send, CheckCircle2, AlertCircle, Info, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Wallet {
    id: string;
    currency: string;
    network: string;
    balance: string;
    address: string;
}

export default function SendPage() {
    const router = useRouter();
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedWalletId, setSelectedWalletId] = useState<string>("");

    // Form States
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<any>(null);

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await apiClient.get('/wallets');
                const validWallets = res.data.data.wallets.filter((w: Wallet) => parseFloat(w.balance) >= 0); // Show all
                setWallets(validWallets);
                if (validWallets.length > 0) {
                    setSelectedWalletId(validWallets[0].id);
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

    const handleMaxAmount = () => {
        if (selectedWallet) {
            setAmount(selectedWallet.balance);
        }
    };

    const handleTransfer = async () => {
        setError(null);
        if (!selectedWallet) return;
        if (!recipient) { setError("Recipient address is required"); return; }
        if (!amount || parseFloat(amount) <= 0) { setError("Please enter a valid amount"); return; }
        if (parseFloat(amount) > parseFloat(selectedWallet.balance)) { setError("Insufficient balance"); return; }

        setIsSubmitting(true);
        try {
            const res = await apiClient.post('/wallets/transfer', {
                walletId: selectedWallet.id,
                toAddress: recipient,
                amount: amount
            });
            setSuccessData(res.data.data.transfer);
        } catch (err: any) {
            console.error('Transfer failed', err);
            setError(err.response?.data?.message || "Transfer failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (successData) {
        return (
            <div className="container flex items-center justify-center h-[calc(100vh-20rem)]">
                <Card className="border-green-100 dark:border-green-900 shadow-lg max-w-3xl mx-auto">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl text-green-700">Transfer Initiated!</CardTitle>
                        <CardDescription>Your request has been sent to the network.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-semibold text-lg">{amount} {selectedWallet?.currency}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Network</span>
                                <span className="font-medium">{selectedWallet?.network}</span>
                            </div>
                            <div className="flex justify-between items-start text-sm">
                                <span className="text-muted-foreground">To</span>
                                <span className="font-mono text-xs max-w-[300px] break-all text-right">{recipient}</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded flex gap-2 items-start dark:bg-blue-900/20 dark:text-blue-200">
                            <Info className="h-4 w-4 shrink-0 mt-0.5" />
                            <p>It may take a few minutes for the transaction to be confirmed on the blockchain.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-2">
                        <Button className="w-full" variant="outline" onClick={() => {
                            setSuccessData(null);
                            setAmount("");
                            setRecipient("");
                        }}>Send Another</Button>
                        <Button className="w-full" onClick={() => router.push('/dashboard/wallet')}>View Wallet</Button>
                    </CardFooter>
                </Card>
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
                    <h1 className="text-2xl font-bold tracking-tight">Send Assets</h1>
                    <p className="text-sm text-muted-foreground">Transfer crypto to another wallet</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
                {/* Main Form */}
                <div>
                    <Card className="shadow-md border-muted/60">
                        <CardHeader>
                            <CardTitle className="text-lg">Transfer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {error && (
                                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Asset</Label>
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

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Recipient Address</Label>
                                        <span className="text-xs text-muted-foreground">Ensure correct network</span>
                                    </div>
                                    <Input
                                        placeholder={`Enter ${getNetworkStandard(selectedWallet?.network) || 'wallet'} address`}
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        className="font-mono text-sm h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Amount</Label>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            Available: <span className="font-medium text-foreground">{selectedWallet?.balance} {selectedWallet?.currency}</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="h-14 text-lg font-semibold pr-16"
                                        />
                                        <div className="absolute right-2 top-2.5 h-9 flex items-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-primary font-medium hover:bg-primary/10"
                                                onClick={handleMaxAmount}
                                            >
                                                MAX
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 text-md font-medium"
                                size="lg"
                                onClick={handleTransfer}
                                disabled={isSubmitting || !selectedWallet}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        Send Now <Send className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info & FAQ */}
                <div className="space-y-6">
                    <Card className="bg-muted/30 border-none shadow-none">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Info className="h-4 w-4" />
                                <span className="text-sm font-medium">Important Info</span>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-2">
                            <p>• Only send <strong>{selectedWallet?.currency}</strong> to <strong>{getNetworkStandard(selectedWallet?.network)}</strong> addresses.</p>
                            <p>• Sending to the wrong network may result in permanent loss of funds.</p>
                            <p>• Network fees are deducted automatically from your transaction or available balance.</p>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <HelpCircle className="h-4 w-4" /> Frequently Asked Questions
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-sm">How long do transfers take?</AccordionTrigger>
                                <AccordionContent className="text-xs text-muted-foreground">
                                    Most transfers confirms within 1-5 minutes. Some networks like Bitcoin or Ethereum may take longer during high congestion.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-sm">Are there fees?</AccordionTrigger>
                                <AccordionContent className="text-xs text-muted-foreground">
                                    Yes, a network gas fee is applied to all blockchain transactions. This fee goes to miners/validators, not us.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-sm">What if I send to wrong address?</AccordionTrigger>
                                <AccordionContent className="text-xs text-muted-foreground">
                                    Unfortunately, blockchain transactions are irreversible. Ensure you verify the address carefully before sending.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-sm">Is there a minimum amount?</AccordionTrigger>
                                <AccordionContent className="text-xs text-muted-foreground">
                                    The minimum amount depends on the network fee. usually it's around 1-5 USDT equivalent.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    );
}
