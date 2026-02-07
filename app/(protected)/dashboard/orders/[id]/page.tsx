"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import apiClient from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, AlertCircle, FileText, ArrowLeft, Download, Wallet, Copy, RefreshCcw, Clock } from "lucide-react";
import PdfPreview from "@/components/ui/pdf-preview";
import { ContractPdfDocument } from "../create/steps/Step4PdfDocument";
import { Separator } from "@/components/ui/separator";
import { pdf } from '@react-pdf/renderer';
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Milestone {
    id: string;
    title: string;
    description: string;
    amount: string;
    status: 'PENDING' | 'PAYMENT_VERIFICATION' | 'IN_PROGRESS' | 'SUBMISSION_REVIEW' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
    order: number;
    proofUrl?: string;
}

interface TimelineItem {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    authorId?: string;
}

interface Contract {
    id: string;
    title: string;
    description: string;
    terms: string;
    totalAmount: string;
    currency: string;
    status: 'DRAFT' | 'PENDING_REVIEW' | 'PENDING_ACCEPTANCE' | 'AGREED' | 'PAYMENT_SUBMITTED' | 'FUNDED' | 'IN_PROGRESS' | 'DELIVERED' | 'DELIVERY_REVIEWED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | 'REJECTED';
    buyerId: string;
    sellerId: string;
    buyer: { name: string; email: string };
    seller: { name: string; email: string };
    orderWalletId?: string;
    orderWallet?: { id: string; address: string; network: string; balance: string };
    milestones: Milestone[];
    timeline: TimelineItem[];
    createdAt: string;
}

const getNetworkStandard = (network: string) => {
    switch (network.toUpperCase()) {
        case 'TRON': return 'TRC-20';
        case 'ETHEREUM': return 'ERC-20';
        case 'BSC': return 'BEP-20';
        default: return network;
    }
};

export default function ContractDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { toast } = useToast();

    const [contract, setContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const lastBlobUrlRef = useRef<string | null>(null);
    const [myWallets, setMyWallets] = useState<{ currency: string; network: string; balance: string }[]>([]);
    const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

    // Timeline State
    const [timelineTitle, setTimelineTitle] = useState("");
    const [timelineDesc, setTimelineDesc] = useState("");
    const [timelineLoading, setTimelineLoading] = useState(false);

    // Confirmation State
    const [confirmationDialog, setConfirmationDialog] = useState({
        isOpen: false,
        title: "",
        description: "",
        action: () => { }
    });

    const handleRefreshBalance = async () => {
        if (!contract?.orderWallet?.id) return;
        setIsRefreshingBalance(true);
        try {
            // Refresh contract data which will auto-sync balance from backend
            await fetchContract();
            toast({ title: "Refreshed", description: "Balance updated" });
        } catch (error) {
            console.error("Failed to refresh balance", error);
            toast({ title: "Error", description: "Failed to refresh balance", variant: "destructive" });
        } finally {
            setIsRefreshingBalance(false);
        }
    };

    useEffect(() => {
        apiClient.get('/wallets').then(res => setMyWallets(res.data.data.wallets)).catch(err => console.error(err));
    }, []);

    const executePayMilestone = async () => {
        setActionLoading(true);
        try {
            const res = await apiClient.post(`/contracts/${id}/pay`);
            toast({ title: "Success", description: "Payment Successful!" });
            const updated = await apiClient.get<{ data: { contract: Contract } }>(`/contracts/${id}`);
            setContract(updated.data.data.contract);
        } catch (error: any) {
            console.error("Payment failed", error);
            toast({ title: "Payment Failed", description: error.response?.data?.message || "Please check your funds and try again.", variant: "destructive" });
        } finally {
            setActionLoading(false);
            setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handlePayMilestone = () => {
        setConfirmationDialog({
            isOpen: true,
            title: "Confirm Payment",
            description: "Are you sure you want to proceed with the payment from your USDT Wallet?",
            action: executePayMilestone
        });
    };

    const executeMilestoneUpdate = async (milestoneId: string, status: string, proofUrl?: string) => {
        setActionLoading(true);
        try {
            await apiClient.patch(`/contracts/${id}/milestones/${milestoneId}`, { status, proofUrl });
            // Refresh
            const updated = await apiClient.get<{ data: { contract: Contract } }>(`/contracts/${id}`);
            setContract(updated.data.data.contract);
            toast({ title: "Success", description: "Milestone status updated" });
        } catch (error: any) {
            console.error("Milestone update error:", error);
            toast({ title: "Error", description: error.response?.data?.message || "Update failed", variant: "destructive" });
        } finally {
            setActionLoading(false);
            setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleMilestoneUpdate = (milestoneId: string, status: string, proofUrl?: string) => {
        setConfirmationDialog({
            isOpen: true,
            title: "Update Milestone Status",
            description: `Are you sure you want to set this milestone to ${status.replace(/_/g, ' ')}?`,
            action: () => executeMilestoneUpdate(milestoneId, status, proofUrl)
        });
    };

    const handleAddTimelineItem = async () => {
        if (!timelineTitle) return;
        setTimelineLoading(true);
        try {
            await apiClient.post(`/contracts/${id}/timeline`, { title: timelineTitle, description: timelineDesc });
            setTimelineTitle("");
            setTimelineDesc("");
            // Refresh
            const updated = await apiClient.get<{ data: { contract: Contract } }>(`/contracts/${id}`);
            setContract(updated.data.data.contract);
            toast({ title: "Success", description: "Timeline item added" });
        } catch (error: any) {
            console.error("Timeline add error:", error);
            toast({ title: "Error", description: "Failed to add timeline item", variant: "destructive" });
        } finally {
            setTimelineLoading(false);
        }
    };


    // Fetch Contract Details
    const fetchContract = async () => {
        if (!id) return;

        try {
            // Using apiClient with relative path, headers handled automatically
            const res = await apiClient.get<{ data: { contract: Contract } }>(`/contracts/${id}`);
            setContract(res.data.data.contract);
        } catch (error) {
            console.error("Error fetching contract:", error);
            toast({ title: "Error", description: "Failed to fetch contract details", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContract();
    }, [id]);

    // Generate PDF when contract loads
    useEffect(() => {
        let active = true;

        const generatePdf = async () => {
            if (!contract) return;

            try {
                if (active) setIsGeneratingPdf(true);

                const blob = await pdf(
                    <ContractPdfDocument
                        title={contract.title}
                        description={contract.description}
                        terms={contract.terms}
                        contractId={contract.id.slice(0, 8)}
                        date={new Date(contract.createdAt).toLocaleDateString()}
                    />
                ).toBlob();

                if (!active) return;

                const url = URL.createObjectURL(blob);
                if (lastBlobUrlRef.current) URL.revokeObjectURL(lastBlobUrlRef.current);
                lastBlobUrlRef.current = url;
                setPdfUrl(url);
            } catch (err) {
                console.error("PDF Gen Error", err);
            } finally {
                if (active) setIsGeneratingPdf(false);
            }
        };

        if (contract) generatePdf();

        return () => {
            active = false;
        };
    }, [contract]);

    // Clean up Ref on unmount
    useEffect(() => {
        return () => {
            if (lastBlobUrlRef.current) {
                URL.revokeObjectURL(lastBlobUrlRef.current);
            }
        };
    }, []);

    const executeStatusUpdate = async (status: string) => {
        setActionLoading(true);
        try {
            await apiClient.patch<{ data: { contract: Contract } }>(`/contracts/${id}/status`, { status });
            // Refresh full data
            await fetchContract();
            toast({ title: "Success", description: `Contract status updated to ${status.replace(/_/g, ' ')}` });
        } catch (error) {
            console.error("Update error:", error);
            toast({ title: "Error", description: "Failed to update contract status", variant: "destructive" });
        } finally {
            setActionLoading(false);
            setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleStatusUpdate = (status: string) => {
        setConfirmationDialog({
            isOpen: true,
            title: "Confirm Status Change",
            description: `Are you sure you want to change the status to ${status.replace(/_/g, ' ')}?`,
            action: () => executeStatusUpdate(status)
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!contract || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <h2 className="text-xl font-semibold">Contract Not Found</h2>
                <Button onClick={() => router.push('/dashboard/orders')}>Return to Dashboard</Button>
            </div>
        );
    }

    const isBuyer = user.id === contract.buyerId;
    const isSeller = user.id === contract.sellerId;

    return (
        <div className="md:p-6 max-w-7xl animate-in fade-in duration-500 space-y-4">

            <AlertDialog open={confirmationDialog.isOpen} onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, isOpen: open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmationDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmationDialog.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => {
                            e.preventDefault();
                            confirmationDialog.action();
                        }} disabled={actionLoading}>
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card rounded-xl border p-6 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/orders')} className="-ml-2 h-6 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-3 w-3 mr-1" /> Back
                        </Button>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-xs font-mono text-muted-foreground">ORDER #{contract.id.slice(0, 8)}</span>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-3">
                        {contract.title}
                        <Badge variant="outline" className={`ml-2 uppercase tracking-wide  rounded-md font-semibold
                            ${['AGREED', 'IN_PROGRESS', 'PAID', 'COMPLETED', 'DELIVERED', 'DELIVERY_REVIEWED'].includes(contract.status) ? 'border-green-500/50 text-green-600 bg-green-500/10' :
                                ['CANCELLED', 'REJECTED', 'DISPUTED'].includes(contract.status) ? 'border-red-500/50 text-red-600 bg-red-500/10' :
                                    'border-blue-500/50 text-blue-600 bg-blue-500/10'}`}>
                            {contract.status.replace(/_/g, ' ')}
                        </Badge>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => fetchContract()} className="h-9" disabled={isLoading}>
                        <RefreshCcw className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    {/* Global Actions */}
                    {isBuyer && contract.status === 'PENDING_ACCEPTANCE' && (
                        <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate('CANCELLED')} disabled={actionLoading}>Cancel Order</Button>
                    )}
                    {isSeller && contract.status === 'PENDING_ACCEPTANCE' && (
                        <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate('CANCELLED')} disabled={actionLoading}>Cancel Order</Button>
                    )}
                    {pdfUrl && (
                        <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl, '_blank')} className="h-9">
                            <Download className="h-3.5 w-3.5 mr-2" /> Agreement
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* --- LEFT COLUMN (INFO) --- */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    {/* Parties */}
                    <Card className="overflow-hidden border-border/60 shadow-sm py-0">
                        <CardHeader className="py-3 px-4 bg-muted/40 border-b">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parties Involved</CardTitle>
                        </CardHeader>
                        <div className="divide-y">
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                                        {contract.buyer?.name?.charAt(0) || "B"}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                            Buyer {isBuyer && <Badge variant="secondary" className="text-[9px] h-4 px-1 ml-1">YOU</Badge>}
                                        </p>
                                        <p className="text-sm font-semibold truncate">{contract.buyer?.name || 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center">
                                        {contract.seller?.name?.charAt(0) || "S"}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                            Seller {isSeller && <Badge variant="secondary" className="text-[9px] h-4 px-1 ml-1">YOU</Badge>}
                                        </p>
                                        <p className="text-sm font-semibold truncate">{contract.seller?.name || 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Summary Stats */}
                    <Card className="overflow-hidden border-border/60 shadow-sm py-0">
                        <div className="p-4 space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">Total Amount</p>
                                <p className="text-2xl font-mono font-bold tracking-tight mt-1">{parseFloat(contract.totalAmount).toLocaleString()} <span className="text-sm text-muted-foreground">{contract.currency}</span></p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Contract Status</p>
                                <p className="text-sm font-medium">{contract.status.replace(/_/g, ' ')}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* --- CENTER COLUMN (ACTION & TRACKER) --- */}
                <div className="col-span-12 lg:col-span-6 space-y-6">

                    {/* PRIMARY ACTION AREA */}
                    <div className="space-y-4">
                        {/* 1. Buyer: Agree & Pay Initial */}
                        {isBuyer && contract.status === 'PENDING_ACCEPTANCE' && (
                            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30">
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                    <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-300">Contract Ready</h3>
                                        <p className="text-sm text-green-700 dark:text-green-400">Review the terms below. If correct, proceed to Payment.</p>
                                    </div>
                                    <Button className="w-full max-w-sm bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate('AGREED')} disabled={actionLoading}>
                                        Agree & Initialize Payment
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* 2. Buyer: Payment Logic (Injecting the existing complex logic here) */}
                        {isBuyer && (contract.status === 'AGREED' || contract.status === 'IN_PROGRESS') && contract.orderWallet && (
                            (() => {
                                const sortedMilestones = [...(contract.milestones || [])].sort((a, b) => a.order - b.order);
                                const pendingMilestone = sortedMilestones.find(m => m.status === 'PENDING');

                                let nextMilestone = null;
                                // Check sequential
                                if (pendingMilestone) {
                                    if (pendingMilestone.order === 1) nextMilestone = pendingMilestone;
                                    else {
                                        const prev = sortedMilestones.find(m => m.order === pendingMilestone.order - 1);
                                        if (prev && prev.status === 'APPROVED') nextMilestone = pendingMilestone;
                                    }
                                }

                                if (!nextMilestone) return null;
                                const amountToPay = parseFloat(nextMilestone.amount);
                                const myUsdtWallet = myWallets.find(w => w.currency === 'USDT' && w.network === 'TRON');
                                const canPay = myUsdtWallet && parseFloat(myUsdtWallet.balance) >= amountToPay;

                                return (
                                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/30 overflow-hidden">
                                        <div className="bg-orange-100/50 dark:bg-orange-900/20 p-4 border-b border-orange-200 dark:border-orange-900/30 flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center animate-pulse">
                                                <Wallet className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-orange-900 dark:text-orange-200">Action Required: Fund Milestone</h3>
                                                <p className="text-xs text-orange-700 dark:text-orange-300">To start <strong>{nextMilestone.title}</strong></p>
                                            </div>
                                        </div>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="flex items-end justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase">Amount Due</p>
                                                    <p className="text-3xl font-bold tracking-tight">{amountToPay.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">{contract.currency}</span></p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Manual Payment */}
                                                <div className="space-y-2 p-3 bg-background/50 rounded-lg border">
                                                    <p className="text-xs font-semibold text-foreground">Option 1: External Deposit</p>
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-[10px] bg-muted p-1.5 rounded flex-1 truncate">{contract.orderWallet.address}</code>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(contract.orderWallet?.address || '')}>
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Button size="sm" variant="secondary" className="w-full text-xs" onClick={() => handleStatusUpdate('PAYMENT_SUBMITTED')} disabled={actionLoading}>
                                                        I Sent the Funds
                                                    </Button>
                                                </div>

                                                {/* Instant Payment */}
                                                <div className="space-y-2 p-3 bg-background/50 rounded-lg border">
                                                    <p className="text-xs font-semibold text-foreground">Option 2: Instant Wallet Pay</p>
                                                    <div className="text-xs text-muted-foreground">
                                                        Balance: <span className={canPay ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{myUsdtWallet ? myUsdtWallet.balance : '0.00'} USDT</span>
                                                    </div>
                                                    <Button size="sm" className="w-full text-xs bg-indigo-600 hover:bg-indigo-700" onClick={handlePayMilestone} disabled={actionLoading || !canPay}>
                                                        {actionLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Wallet className="h-3 w-3 mr-1" />}
                                                        Pay Now
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })()
                        )}

                        {/* 3. Seller: Deliver Action */}
                        {isSeller && contract.status === 'IN_PROGRESS' && (
                            <Card className="border-cyan-200 bg-cyan-50 dark:bg-cyan-900/10 border-l-4 border-l-cyan-500">
                                <div className="p-4 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-cyan-600" />
                                        <div>
                                            <h3 className="font-semibold text-cyan-900 dark:text-cyan-200">Work In Progress</h3>
                                            <p className="text-xs text-cyan-700 dark:text-cyan-300">Submit milestones for review or mark contract as fully delivered.</p>
                                        </div>
                                    </div>
                                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => handleStatusUpdate('DELIVERED')} disabled={actionLoading}>
                                        Mark Final Delivery
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* 4. Buyer: Final Confirmation */}
                        {isBuyer && contract.status === 'DELIVERY_REVIEWED' && (
                            <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 border-l-4 border-l-green-500">
                                <div className="p-4 flex flex-row items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-green-900 dark:text-green-200">Delivery Verified</h3>
                                        <p className="text-xs text-green-700 dark:text-green-300">Admin has reviewed the delivery. Confirm to release funds.</p>
                                    </div>
                                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate('COMPLETED')} disabled={actionLoading}>
                                        Confirm & Release
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Status Alerts */}
                        {contract.status === 'PAYMENT_SUBMITTED' && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex gap-3 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                                <div>
                                    <span className="font-semibold">Verification in Progress.</span> Admin is checking your payment.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Milestones Stepper */}
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="py-4 px-6 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold">Milestone Progression</CardTitle>
                            <Badge variant="secondary" className="text-[10px] h-5">Live Tracker</Badge>
                        </CardHeader>
                        <div className="p-6">
                            <div className="space-y-8 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-border/50" />

                                {(contract.milestones || []).map((milestone, idx) => (
                                    <div key={milestone.id} className="relative pl-10">
                                        {/* Dot Indicator */}
                                        <div className={`absolute left-0 top-1.5 h-7 w-7 rounded-full border-2 flex items-center justify-center z-10 bg-background
                                            ${milestone.status === 'PAID' ? 'border-green-500 text-green-500' :
                                                ['PAYMENT_VERIFICATION', 'SUBMISSION_REVIEW'].includes(milestone.status) ? 'border-amber-500 text-amber-500 animate-pulse' :
                                                    milestone.status === 'APPROVED' ? 'border-blue-500 text-blue-500' :
                                                        'border-muted text-muted-foreground'}`}>
                                            <span className="text-[10px] font-bold">{idx + 1}</span>
                                        </div>

                                        <div className="bg-card hover:bg-muted/10 transition-colors rounded-lg border p-4 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="text-sm font-semibold">{milestone.title}</h4>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{milestone.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-mono font-medium">{parseFloat(milestone.amount).toLocaleString()} {contract.currency}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-dashed">
                                                <Badge variant="outline" className={`text-[10px] h-5 
                                                    ${milestone.status === 'PAID' ? 'bg-green-500/10 text-green-600 border-green-200' : ''}`}>
                                                    {milestone.status === 'PAYMENT_VERIFICATION' ? 'Verifying Payment' :
                                                        milestone.status === 'SUBMISSION_REVIEW' ? 'In Review (Admin)' :
                                                            milestone.status.replace(/_/g, ' ')}
                                                </Badge>

                                                <div className="flex items-center gap-2">
                                                    {/* Seller Milestone Actions */}
                                                    {isSeller && milestone.status === 'PAID' && (
                                                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleMilestoneUpdate(milestone.id, 'IN_PROGRESS')}>Start Work</Button>
                                                    )}
                                                    {isSeller && milestone.status === 'IN_PROGRESS' && (
                                                        <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => handleMilestoneUpdate(milestone.id, 'SUBMISSION_REVIEW')}>Submit for Review</Button>
                                                    )}

                                                    {/* Buyer Milestone Actions */}
                                                    {isBuyer && milestone.status === 'SUBMITTED' && (
                                                        <>
                                                            <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleMilestoneUpdate(milestone.id, 'APPROVED')}>Approve</Button>
                                                            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleMilestoneUpdate(milestone.id, 'REJECTED')}>Reject</Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* PDF Previewer */}
                    <div className="border rounded-xl overflow-hidden bg-background">
                        <div className="bg-muted/40 p-3 border-b flex justify-between items-center">
                            <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                <FileText className="h-3 w-3" /> Agreement Preview
                            </span>
                        </div>
                        <div className="h-fit">
                            {pdfUrl ? (
                                <div className="">
                                    <PdfPreview file={pdfUrl} />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN (WALLET & TIMELINE) --- */}
                <div className="col-span-12 lg:col-span-3 space-y-6">

                    {/* Escrow Wallet Card */}
                    {contract.orderWallet ? (
                        <Card className="border-border/60 shadow-md py-0">
                            <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                    <Wallet className="h-3.5 w-3.5" /> ESCROW WALLET
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <p className="text-2xl font-bold font-mono text-foreground">{contract.orderWallet.balance}</p>
                                        <span className="text-xs font-semibold text-muted-foreground">USDT</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-mono bg-muted p-1.5 rounded break-all border truncate">
                                        {contract.orderWallet.address}
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={handleRefreshBalance} disabled={isRefreshingBalance}>
                                    {isRefreshingBalance ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCcw className="h-3 w-3 mr-1" />}
                                    Refresh Balance
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="p-4 border-dashed flex flex-col items-center justify-center text-center text-muted-foreground">
                            <Wallet className="h-6 w-6 mb-2 opacity-50" />
                            <p className="text-xs">No Escrow Wallet Assigned</p>
                        </Card>
                    )}

                    {/* Timeline Log */}
                    <Card className="border-border/60 shadow-sm h-fit py-0">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" /> PROJECT TIMELINE
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-2">
                            {/* Seller Update Form */}
                            {isSeller && contract.status !== 'COMPLETED' && (
                                <div className="space-y-2 p-2 bg-muted/40 rounded-lg border">
                                    <h4 className="text-xs font-semibold">Post Update</h4>
                                    <input
                                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors"
                                        placeholder="Title..."
                                        value={timelineTitle}
                                        onChange={(e) => setTimelineTitle(e.target.value)}
                                    />
                                    <textarea
                                        className="flex min-h-[50px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm"
                                        placeholder="Description..."
                                        value={timelineDesc}
                                        onChange={(e) => setTimelineDesc(e.target.value)}
                                    />
                                    <Button size="sm" className="w-full h-7 text-xs" onClick={handleAddTimelineItem} disabled={timelineLoading || !timelineTitle}>
                                        {timelineLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : "Post"}
                                    </Button>
                                </div>
                            )}

                            <div className="max-h-[300px] overflow-y-auto pr-1">
                                {(contract.timeline || []).length > 0 ? (
                                    <div className="space-y-4">
                                        {contract.timeline.map((item) => (
                                            <div key={item.id} className="relative pl-3 border-l-2 border-muted pb-1">
                                                <div className="absolute top-0 left-[-5px] h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                                                <p className="text-[10px] text-muted-foreground mb-0.5">
                                                    {new Date(item.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-xs font-medium text-foreground">{item.title}</p>
                                                {item.description && <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-xs text-muted-foreground">No events recorded.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
