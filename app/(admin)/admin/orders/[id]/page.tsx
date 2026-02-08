"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Wallet, 
  Download, 
  Clock, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink,
  User,
  CreditCard,
  Package,
  Play,
  Send,
  Check,
  RotateCcw,
  ChevronRight,
  MessageCircle,
  Shield,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PdfPreview from "@/components/ui/pdf-preview";
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
import { FloatingOrderChat } from "@/components/chat/FloatingOrderChat";
import { useAuthStore } from "@/lib/store/auth-store";

// Types matching backend
interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: string;
  status: 'PENDING' | 'PAYMENT_VERIFICATION' | 'PAID' | 'IN_PROGRESS' | 'SUBMISSION_REVIEW' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  order: number;
  proofUrl?: string;
  createdAt: string;
}

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  authorId?: string;
}

interface ContractWallet {
  id: string;
  address: string;
  network: string;
  balance: string;
  currency: string;
}

interface Contract {
  id: string;
  title: string;
  description: string;
  terms: string;
  totalAmount: string;
  currency: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PENDING_ACCEPTANCE' | 'AGREED' | 'PAYMENT_SUBMITTED' | 'IN_PROGRESS' | 'DELIVERED' | 'DELIVERY_REVIEWED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | 'REJECTED';
  buyerId: string;
  sellerId: string;
  buyer: { name: string; email: string; userReferenceId?: string };
  seller: { name: string; email: string; userReferenceId?: string };
  contract_wallets?: ContractWallet;
  milestones: Milestone[];
  timeline_items: TimelineItem[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; description: string }> = {
  DRAFT: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted", icon: FileText, description: "Order is in draft state" },
  PENDING_REVIEW: { label: "Pending Review", color: "text-amber-600", bg: "bg-amber-500/10", icon: Clock, description: "Awaiting admin approval" },
  PENDING_ACCEPTANCE: { label: "Pending Acceptance", color: "text-blue-600", bg: "bg-blue-500/10", icon: User, description: "Waiting for buyer to accept" },
  AGREED: { label: "Agreed", color: "text-emerald-600", bg: "bg-emerald-500/10", icon: CheckCircle2, description: "Terms agreed, awaiting payment" },
  PAYMENT_SUBMITTED: { label: "Payment Submitted", color: "text-orange-600", bg: "bg-orange-500/10", icon: CreditCard, description: "Payment sent, awaiting verification" },
  IN_PROGRESS: { label: "In Progress", color: "text-indigo-600", bg: "bg-indigo-500/10", icon: Play, description: "Work in progress" },
  DELIVERED: { label: "Delivered", color: "text-purple-600", bg: "bg-purple-500/10", icon: Package, description: "Work delivered, awaiting review" },
  DELIVERY_REVIEWED: { label: "Delivery Reviewed", color: "text-cyan-600", bg: "bg-cyan-500/10", icon: CheckCircle2, description: "Delivery reviewed by admin" },
  COMPLETED: { label: "Completed", color: "text-green-600", bg: "bg-green-500/10", icon: CheckCircle2, description: "Order completed successfully" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-500/10", icon: XCircle, description: "Order was cancelled" },
  REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-500/10", icon: XCircle, description: "Order was rejected" },
  DISPUTED: { label: "Disputed", color: "text-red-600", bg: "bg-red-500/10", icon: AlertCircle, description: "Order is under dispute" },
};

const MILESTONE_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-muted-foreground", bg: "bg-muted" },
  PAYMENT_VERIFICATION: { label: "Verifying", color: "text-amber-600", bg: "bg-amber-500/10" },
  IN_PROGRESS: { label: "In Progress", color: "text-indigo-600", bg: "bg-indigo-500/10" },
  SUBMISSION_REVIEW: { label: "Review", color: "text-purple-600", bg: "bg-purple-500/10" },
  SUBMITTED: { label: "Submitted", color: "text-blue-600", bg: "bg-blue-500/10" },
  APPROVED: { label: "Approved", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-500/10" },
  PAID: { label: "Paid", color: "text-green-600", bg: "bg-green-500/10" },
};

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // PDF State
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const lastBlobUrlRef = useRef<string | null>(null);

  // Wallet History State
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Dialog state
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => { } });

  const fetchWalletHistory = useCallback(async (walletId: string) => {
    try {
      setHistoryLoading(true);
      const res = await apiClient.get(`/wallets/${walletId}/history`);
      setWalletHistory(res.data.data.transactions);
    } catch (error) {
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchContract = useCallback(async (showLoading = true) => {
    if (!id) return;
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);

    try {
      const res = await apiClient.get<{ data: { contract: Contract } }>(`/contracts/${id}`);
      setContract(res.data.data.contract);
    } catch (err: any) {
      console.error("Failed to fetch contract", err);
      toast({ title: "Error", description: "Failed to load contract details", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  useEffect(() => {
    if (contract?.contract_wallets?.id) {
      fetchWalletHistory(contract.contract_wallets.id);
    }
  }, [contract?.contract_wallets?.id, fetchWalletHistory]);

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

  // Clean up PDF URL on unmount
  useEffect(() => {
    return () => {
      if (lastBlobUrlRef.current) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
      }
    };
  }, []);

  const executeAction = async (action: () => Promise<void>) => {
    setActionLoading(true);
    try {
      await action();
      await fetchContract(false);
    } catch (error: any) {
      console.error("Action failed:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Action failed",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
      setDialog(prev => ({ ...prev, open: false }));
    }
  };

  const updateStatus = async (status: string) => {
    await apiClient.patch(`/contracts/${id}/status`, { status });
    toast({ title: "Success", description: `Status updated to ${status.replace(/_/g, ' ')}` });
  };

  const updateMilestone = async (milestoneId: string, status: string) => {
    await apiClient.patch(`/contracts/${id}/milestones/${milestoneId}`, { status });
    toast({ title: "Success", description: "Milestone updated" });
  };

  const openConfirmDialog = (title: string, description: string, action: () => Promise<void>) => {
    setDialog({
      open: true,
      title,
      description,
      action: () => executeAction(action),
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard` });
  };

  const handleRefreshBalance = async () => {
    if (!contract?.contract_wallets?.id) return;
    try {
      setIsRefreshing(true);
      await fetchContract(false);
      await fetchWalletHistory(contract.contract_wallets.id);
      toast({ title: "Refreshed", description: "Balance and history updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to refresh", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Order Not Found</h2>
          <p className="text-muted-foreground mt-1">The order you&apos;re looking for doesn&apos;t exist.</p>
        </div>
        <Button onClick={() => router.push('/admin/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = statusConfig.icon;

  // Calculate progress
  const totalMilestones = contract.milestones?.length || 0;
  const completedMilestones = contract.milestones?.filter(m =>
    ['APPROVED', 'PAID'].includes(m.status)
  ).length || 0;
  const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  // Get sorted milestones
  const sortedMilestones = [...(contract.milestones || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Confirmation Dialog */}
      <AlertDialog open={dialog.open} onOpenChange={(open) => setDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={dialog.action} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 -ml-2"
            onClick={() => router.push('/admin/orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Orders
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-mono text-xs">{contract.id.slice(0, 8).toUpperCase()}</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-xs">Admin View</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{contract.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0 font-medium`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {format(new Date(contract.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchContract(false)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {pdfUrl && (
              <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl, '_blank')}>
                <Download className="h-4 w-4 mr-2" /> PDF
              </Button>
            )}

            {!['COMPLETED', 'CANCELLED', 'REJECTED'].includes(contract.status) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openConfirmDialog(
                  "Force Cancel Order",
                  "Are you sure you want to force cancel this order? This action cannot be undone.",
                  () => updateStatus('CANCELLED')
                )}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Force Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {totalMilestones > 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedMilestones} of {totalMilestones} milestones completed
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Action Alerts */}
      {(contract.status === 'PENDING_REVIEW' || contract.status === 'PAYMENT_SUBMITTED' || contract.status === 'DELIVERED' || contract.status === 'DELIVERY_REVIEWED' || (contract.status === 'COMPLETED' && Number(contract.contract_wallets?.balance || 0) > 0)) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Admin Action Required</h3>
                  <p className="text-xs text-muted-foreground">{statusConfig.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                {contract.status === 'PENDING_REVIEW' && (
                  <>
                    <Button 
                      className="flex-1 md:flex-none bg-green-600 hover:bg-green-700" 
                      size="sm"
                      onClick={() => openConfirmDialog("Approve Order", "Approve and send this order to the buyer?", () => updateStatus('PENDING_ACCEPTANCE'))}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="flex-1 md:flex-none"
                      onClick={() => openConfirmDialog("Reject Order", "Reject this order?", () => updateStatus('REJECTED'))}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </>
                )}
                {contract.status === 'PAYMENT_SUBMITTED' && (
                  <>
                    <Button 
                      className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700" 
                      size="sm"
                      onClick={() => openConfirmDialog("Verify Payment", "Confirm payment received?", () => updateStatus('IN_PROGRESS'))}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Verify Payment
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="flex-1 md:flex-none"
                      onClick={() => openConfirmDialog("Reject Payment", "Reject this payment?", () => updateStatus('AGREED'))}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </>
                )}
                {contract.status === 'DELIVERED' && (
                  <Button 
                    className="flex-1 md:flex-none bg-cyan-600 hover:bg-cyan-700" 
                    size="sm"
                    onClick={() => openConfirmDialog("Review Delivery", "Mark delivery as reviewed?", () => updateStatus('DELIVERY_REVIEWED'))}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Review Delivery
                  </Button>
                )}
                {(contract.status === 'DELIVERY_REVIEWED' || (contract.status === 'COMPLETED' && Number(contract.contract_wallets?.balance || 0) > 0)) && (
                  <Button 
                    className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700" 
                    size="sm"
                    onClick={() => openConfirmDialog("Release Funds", "Force release funds to seller?", () => updateStatus('COMPLETED'))}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Force Release Funds
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-3 space-y-6">
          {/* Amount Card */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 via-card to-muted/20">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-3xl font-bold">
                {parseFloat(contract.totalAmount).toLocaleString()}
                <span className="text-lg text-muted-foreground ml-1">{contract.currency}</span>
              </p>
            </CardContent>
          </Card>

          {/* Parties Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" /> Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buyer */}
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">
                    {contract.buyer?.name?.charAt(0) || 'B'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Buyer</p>
                  <p className="text-sm text-muted-foreground truncate">{contract.buyer?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{contract.buyer?.email}</p>
                </div>
              </div>

              <Separator />

              {/* Seller */}
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <span className="text-emerald-600 font-semibold text-sm">
                    {contract.seller?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Seller</p>
                  <p className="text-sm text-muted-foreground truncate">{contract.seller?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{contract.seller?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Wallet */}
          {contract.contract_wallets ? (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4" /> Escrow Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-bold font-mono">
                    {parseFloat(contract.contract_wallets.balance || '0').toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{contract.contract_wallets.currency}</p>
                </div>
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-[10px] text-muted-foreground mb-1">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] font-mono flex-1 truncate">
                      {contract.contract_wallets.address}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => copyToClipboard(contract.contract_wallets!.address, "Address")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs" 
                  onClick={handleRefreshBalance}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-3 w-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Balance
                </Button>

                {/* Recent History */}
                <div className="pt-2 border-t">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Recent History</p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {historyLoading ? (
                      <div className="text-center py-2"><Loader2 className="h-4 w-4 animate-spin mx-auto opacity-50" /></div>
                    ) : walletHistory.length > 0 ? (
                      walletHistory.slice(0, 5).map((tx: any) => {
                        const isIncoming = ['in', 'incoming'].includes(tx.direction?.toLowerCase());
                        return (
                          <div key={tx.id} className="flex justify-between items-center text-xs">
                            <span className={isIncoming ? 'text-green-600' : 'text-blue-600'}>
                              {isIncoming ? '+' : '-'}{parseFloat(tx.amount || '0').toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(tx.dateCreated), 'MMM d')}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[10px] text-muted-foreground text-center">No activity</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-4 text-center text-muted-foreground">
                <Wallet className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No Escrow Wallet Assigned</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" /> Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {(contract.timeline_items || []).length > 0 ? (
                  contract.timeline_items.map((item) => (
                    <div key={item.id} className="relative pl-4 border-l-2 border-muted">
                      <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-primary" />
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(item.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                      <p className="text-sm font-medium mt-0.5">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">No events yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Agreement & Chat */}
        <div className="lg:col-span-6 space-y-6">
          {/* Terms & Agreement Document */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Terms & Agreement
                </CardTitle>
                {pdfUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl, '_blank')}>
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isGeneratingPdf ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-3" />
                  <span>Generating document preview...</span>
                </div>
              ) : pdfUrl ? (
                <div className="bg-muted/30">
                  <PdfPreview file={pdfUrl} />
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Failed to generate document preview</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {contract.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Milestones */}
        <div className="lg:col-span-3 space-y-6">
          {/* Milestones */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedMilestones.map((milestone, index) => {
                const msConfig = MILESTONE_STATUS_CONFIG[milestone.status] || MILESTONE_STATUS_CONFIG.PENDING;
                return (
                  <div key={milestone.id} className="p-3 rounded-lg bg-muted/30 border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">#{index + 1}</span>
                          <span className="text-sm font-medium truncate">{milestone.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{parseFloat(milestone.amount).toLocaleString()} {contract.currency}</p>
                      </div>
                      <Badge className={`${msConfig.bg} ${msConfig.color} border-0 text-[10px] shrink-0`}>
                        {msConfig.label}
                      </Badge>
                    </div>

                    {/* Admin Milestone Actions */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                      {milestone.status === 'PAYMENT_VERIFICATION' && (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-green-600 hover:bg-green-700"
                          onClick={() => openConfirmDialog("Verify Payment", "Verify this milestone payment?", () => updateMilestone(milestone.id, 'PAID'))}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Verify
                        </Button>
                      )}
                      {milestone.status === 'SUBMISSION_REVIEW' && (
                        <>
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => openConfirmDialog("Approve Work", "Approve this milestone work?", () => updateMilestone(milestone.id, 'SUBMITTED'))}
                          >
                            <Check className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs"
                            onClick={() => openConfirmDialog("Reject Work", "Reject this milestone work?", () => updateMilestone(milestone.id, 'REJECTED'))}
                          >
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {sortedMilestones.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No milestones</p>
              )}
            </CardContent>
          </Card>

          {/* Order Metadata */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-xs">{contract.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(contract.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{format(new Date(contract.updatedAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency</span>
                <span>{contract.currency}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Order Chat - Admin can participate */}
      <FloatingOrderChat
        contractId={contract.id}
        buyerId={contract.buyerId}
        sellerId={contract.sellerId}
        buyerName={contract.buyer?.name || 'Buyer'}
        sellerName={contract.seller?.name || 'Seller'}
        orderStatus={contract.status}
      />
    </div>
  );
}
