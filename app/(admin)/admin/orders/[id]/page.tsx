"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, AlertCircle, FileText, Wallet, Download, Clock, RefreshCcw, ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PdfPreview from "@/components/ui/pdf-preview";
// Import from the protected dashboard path
import { ContractPdfDocument } from "@/app/(protected)/dashboard/orders/create/steps/Step4PdfDocument";
import { pdf } from '@react-pdf/renderer';
import { format } from "date-fns";
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
    status: 'PENDING' | 'PAYMENT_VERIFICATION' | 'PAID' | 'IN_PROGRESS' | 'SUBMISSION_REVIEW' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    order: number;
    proofUrl?: string;
}

interface Contract {
    id: string;
    title: string;
    description: string;
    terms: string;
    totalAmount: string;
    currency: string;
    status: string;
    currentStep: number;
    seller: { name: string; email: string };
    buyer: { name: string; email: string };
    milestones: Milestone[];
    timeline: TimelineItem[]; // Added timeline
    orderWalletId?: string;
    orderWallet?: { id: string; address: string; network: string; balance: string };
    createdAt: string;
}

interface TimelineItem {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

export default function AdminOrderDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const { toast } = useToast();

    const [contract, setContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // PDF State
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const lastBlobUrlRef = useRef<string | null>(null);
    // Wallet History State
    const [walletHistory, setWalletHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Confirmation State
    const [confirmationDialog, setConfirmationDialog] = useState({
        isOpen: false,
        title: "",
        description: "",
        action: () => { }
    });

    const fetchWalletHistory = async (walletId: string) => {
        try {
            setHistoryLoading(true);
            const res = await apiClient.get(`/wallets/${walletId}/history`);
            setWalletHistory(res.data.data.transactions);
        } catch (error) {
            console.error(error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleRefreshBalance = async () => {
        if (!contract?.orderWallet?.id) return;
        try {
            setIsProcessing(true);
            // Refresh contract data which will auto-sync balance from backend
            await fetchContract();
            // Also refresh history
            if (contract.orderWallet.id) {
                await fetchWalletHistory(contract.orderWallet.id);
            }
            toast({ title: "Refreshed", description: "Balance and history updated" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to refresh", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (contract?.orderWallet?.id) {
            fetchWalletHistory(contract.orderWallet.id);
        }
    }, [contract?.orderWallet?.id]);

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

    const fetchContract = async () => {
        try {
            const res = await apiClient.get<{ data: { contract: Contract } }>(`/contracts/${id}`);
            setContract(res.data.data.contract);
        } catch (err) {
            console.error("Failed to fetch contract", err);
            toast({ title: "Error", description: "Failed to load contract details", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchContract();
    }, [id]);

    const executeStatusUpdate = async (newStatus: string) => {
        try {
            setIsProcessing(true);
            await apiClient.patch(`/contracts/${id}/status`, { status: newStatus });
            // Refresh full data (including new wallet, timeline, etc.)
            await fetchContract();
            toast({ title: "Success", description: `Contract status updated to ${newStatus}` });
        } catch (err) {
            console.error("Failed to update status", err);
            toast({ title: "Error", description: "Failed to update contract status", variant: "destructive" });
        } finally {
            setIsProcessing(false);
            setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleStatusUpdate = (newStatus: string) => {
        setConfirmationDialog({
            isOpen: true,
            title: "Confirm Status Change",
            description: `Are you sure you want to change the status to ${newStatus.replace(/_/g, ' ')}? This action may trigger notifications to all parties.`,
            action: () => executeStatusUpdate(newStatus)
        });
    };

    const executeMilestoneUpdate = async (milestoneId: string, status: string) => {
        setIsProcessing(true);
        try {
            await apiClient.patch(`/contracts/${id}/milestones/${milestoneId}`, { status });
            // Refresh
            fetchContract();
            toast({ title: "Success", description: "Milestone updated" });
        } catch (error: any) {
            console.error("Milestone update error:", error);
            toast({ title: "Error", description: error.response?.data?.message || "Update failed", variant: "destructive" });
        } finally {
            setIsProcessing(false);
            setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleMilestoneUpdate = (milestoneId: string, status: string) => {
        setConfirmationDialog({
            isOpen: true,
            title: "Confirm Milestone Update",
            description: `Are you sure you want to mark this milestone as ${status.replace(/_/g, ' ')}?`,
            action: () => executeMilestoneUpdate(milestoneId, status)
        });
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!contract) return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h2 className="text-xl font-semibold">Contract Not Found</h2>
            <Button onClick={() => router.push('/admin/orders')}>Return to List</Button>
        </div>
    );

    return (
        <div className="mx-auto md:p-6 max-w-7xl animate-in fade-in duration-500 space-y-4">

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
                            e.preventDefault(); // Prevent auto-close
                            confirmationDialog.action();
                        }} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card rounded-xl border p-6 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/orders')} className="-ml-2 h-6 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-3 w-3 mr-1" /> Back
                        </Button>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-xs font-mono text-muted-foreground">ORDER #{contract.id.slice(0, 8)}</span>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-3">
                        {contract.title}
                        <Badge variant="outline" className={`ml-2 uppercase tracking-wide text-xs  rounded-md font-semibold
                            ${['AGREED', 'IN_PROGRESS', 'PAID', 'COMPLETED'].includes(contract.status) ? 'border-green-500/50 text-green-600 bg-green-500/10' :
                                ['CANCELLED', 'REJECTED'].includes(contract.status) ? 'border-red-500/50 text-red-600 bg-red-500/10' :
                                    'border-blue-500/50 text-blue-600 bg-blue-500/10'}`}>
                            {contract.status.replace(/_/g, ' ')}
                        </Badge>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => fetchContract()} className="h-9" disabled={isLoading}>
                        <RefreshCcw className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    {!['COMPLETED', 'CANCELLED', 'REJECTED'].includes(contract.status) && (
                        <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate('CANCELLED')} className="h-9">
                            Force Cancel
                        </Button>
                    )}
                    {pdfUrl && (
                        <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl, '_blank')} className="h-9">
                            <Download className="h-3.5 w-3.5 mr-2" /> PDF Agreement
                        </Button>
                    )}
                </div>
            </div>

            {/* --- TOP ADMIN ALERTS --- */}
            {(contract.status === 'PENDING_REVIEW' || contract.status === 'PAYMENT_SUBMITTED' || contract.status === 'DELIVERED' || contract.status === 'DELIVERY_REVIEWED' || (contract.status === 'COMPLETED' && Number(contract.orderWallet?.balance || 0) > 0)) && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-foreground">Action Required</h3>
                            <p className="text-xs text-muted-foreground">Order is waiting for admin verification to proceed.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {contract.status === 'PENDING_REVIEW' && (
                            <>
                                <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate('PENDING_ACCEPTANCE')} disabled={isProcessing}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve & Send
                                </Button>
                                <Button variant="secondary" className="w-full md:w-auto" onClick={() => handleStatusUpdate('REJECTED')} disabled={isProcessing}>
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </>
                        )}
                        {contract.status === 'PAYMENT_SUBMITTED' && (
                            <>
                                <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700" onClick={() => handleStatusUpdate('IN_PROGRESS')} disabled={isProcessing}>
                                    <Wallet className="mr-2 h-4 w-4" /> Verify Initial Payment
                                </Button>
                                <Button variant="destructive" className="w-full md:w-auto" onClick={() => handleStatusUpdate('AGREED')} disabled={isProcessing}>
                                    <XCircle className="mr-2 h-4 w-4" /> Reject Payment
                                </Button>
                            </>
                        )}
                        {contract.status === 'DELIVERED' && (
                            <Button className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-700" onClick={() => handleStatusUpdate('DELIVERY_REVIEWED')} disabled={isProcessing}>
                                <FileText className="mr-2 h-4 w-4" /> Review Delivery
                            </Button>
                        )}
                        {(contract.status === 'DELIVERY_REVIEWED' || (contract.status === 'COMPLETED' && Number(contract.orderWallet?.balance || 0) > 0)) && (
                            <Button className="w-full md:w-auto bg-orange-600 hover:bg-orange-700" onClick={() => handleStatusUpdate('COMPLETED')} disabled={isProcessing}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Force Release Funds (Retry)
                            </Button>
                        )}
                    </div>
                </div>
            )}


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
                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">B</div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Buyer</p>
                                        <p className="text-sm font-semibold truncate">{contract.buyer?.name || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground truncate">{contract.buyer?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center">S</div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Seller</p>
                                        <p className="text-sm font-semibold truncate">{contract.seller?.name || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground truncate">{contract.seller?.email}</p>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Milestones</p>
                                    <p className="text-sm font-medium">{(contract.milestones || []).length} Steps</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* --- CENTER COLUMN (CONTENT) --- */}
                <div className="col-span-12 lg:col-span-6 space-y-6">

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
                                                    {milestone.status.replace(/_/g, ' ')}
                                                </Badge>

                                                <div className="flex items-center gap-2">
                                                    {milestone.status === 'PAYMENT_VERIFICATION' && (
                                                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleMilestoneUpdate(milestone.id, 'PAID')}>
                                                            Verify Payment
                                                        </Button>
                                                    )}
                                                    {milestone.status === 'SUBMISSION_REVIEW' && (
                                                        <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => handleMilestoneUpdate(milestone.id, 'SUBMITTED')}>
                                                            Verify Work
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* PDF Previewer (Collapsible or Block) */}
                    <div className="border rounded-xl overflow-hidden bg-background">
                        <div className="bg-muted/40 p-3 border-b flex justify-between items-center">
                            <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                <FileText className="h-3 w-3" /> Agreement Preview
                            </span>
                        </div>
                        <div className="">
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

                {/* --- RIGHT COLUMN (FINANCE) --- */}
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
                                <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={handleRefreshBalance} disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCcw className="h-3 w-3 mr-1" />}
                                    Refresh Balance
                                </Button>

                                <Separator />

                                <div>
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Recent History</p>
                                    <div className="space-y-2 h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                        {historyLoading ? (
                                            <div className="text-center py-4"><Loader2 className="h-4 w-4 animate-spin mx-auto opacity-50" /></div>
                                        ) : walletHistory.length > 0 ? (
                                            walletHistory.map((tx: any) => {
                                                const isIncoming = ['in', 'incoming'].includes(tx.direction?.toLowerCase());
                                                const isFailed = tx.status?.toLowerCase() === 'failed';
                                                const hash = tx.hash || tx.id; // Fallback to ID if hash missing (as seen in sample)

                                                return (
                                                    <div key={tx.id} className="flex flex-col gap-1 p-2 rounded hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${isFailed ? 'bg-red-100 text-red-600' :
                                                                    isIncoming ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                                    }`}>
                                                                    {isFailed ? <XCircle className="h-3 w-3" /> : (isIncoming ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />)}
                                                                </div>
                                                                <div>
                                                                    <p className={`text-xs font-mono font-medium ${isFailed ? 'text-muted-foreground line-through' : (isIncoming ? 'text-green-600' : 'text-blue-600')}`}>
                                                                        {isIncoming ? '+' : '-'}{parseFloat(tx.amount || '0').toLocaleString()} {tx.currency || 'USDT'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full capitalize ${isFailed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                                                }`}>
                                                                {tx.status}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between items-center pl-7">
                                                            <span className="text-[10px] text-muted-foreground">{format(new Date(tx.dateCreated), 'MMM d, hh:mm a')}</span>
                                                            {hash && (
                                                                <a href={`https://nile.tronscan.org/#/transaction/${hash}`} target="_blank" className="text-[10px] text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                                                    {hash.substring(0, 4)}...{hash.substring(hash.length - 4)} <ExternalLink className="h-2.5 w-2.5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <p className="text-[10px] text-muted-foreground text-center py-2">No activity recorded</p>
                                        )}
                                    </div>
                                </div>
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
                                <Clock className="h-3.5 w-3.5" /> AUDIT LOG
                            </CardTitle>
                        </CardHeader>
                        <div className="p-0">
                            <div className="max-h-[300px] overflow-y-auto">
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
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
