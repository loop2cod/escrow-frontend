"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import apiClient from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Wallet,
  Copy,
  RefreshCw,
  Clock,
  Package,
  User,
  FileText,
  CreditCard,
  ChevronRight,
  Send,
  Play,
  Check,
  RotateCcw,
  Download,
} from "lucide-react";
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
import { format } from "date-fns";
import { pdf } from '@react-pdf/renderer';
import { ContractPdfDocument } from "../create/steps/Step4PdfDocument";
import PdfPreview from "@/components/ui/pdf-preview";
import { FloatingOrderChat } from "@/components/chat/FloatingOrderChat";

// Types matching backend
interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: string;
  status: 'PENDING' | 'PAYMENT_VERIFICATION' | 'IN_PROGRESS' | 'SUBMISSION_REVIEW' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
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

interface UserWallet {
  id: string;
  currency: string;
  network: string;
  balance: string;
  address: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  DRAFT: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted", icon: FileText },
  PENDING_REVIEW: { label: "Pending Review", color: "text-amber-600", bg: "bg-amber-500/10", icon: Clock },
  PENDING_ACCEPTANCE: { label: "Pending Acceptance", color: "text-blue-600", bg: "bg-blue-500/10", icon: User },
  AGREED: { label: "Agreed", color: "text-emerald-600", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  PAYMENT_SUBMITTED: { label: "Payment Submitted", color: "text-orange-600", bg: "bg-orange-500/10", icon: CreditCard },
  IN_PROGRESS: { label: "In Progress", color: "text-indigo-600", bg: "bg-indigo-500/10", icon: Play },
  DELIVERED: { label: "Delivered", color: "text-purple-600", bg: "bg-purple-500/10", icon: Package },
  DELIVERY_REVIEWED: { label: "Delivery Reviewed", color: "text-cyan-600", bg: "bg-cyan-500/10", icon: CheckCircle2 },
  COMPLETED: { label: "Completed", color: "text-green-600", bg: "bg-green-500/10", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-500/10", icon: XCircle },
  REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-500/10", icon: XCircle },
  DISPUTED: { label: "Disputed", color: "text-red-600", bg: "bg-red-500/10", icon: AlertCircle },
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

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [myWallets, setMyWallets] = useState<UserWallet[]>([]);

  // PDF State
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const lastBlobUrlRef = useRef<string | null>(null);

  // Dialog state
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => { } });

  // Timeline form state
  const [timelineForm, setTimelineForm] = useState({ title: "", description: "" });
  const [isAddingTimeline, setIsAddingTimeline] = useState(false);

  const fetchContract = useCallback(async (showLoading = true) => {
    if (!id) return;
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);

    try {
      const res = await apiClient.get<{ data: { contract: Contract } }>(`/contracts/${id}`);
      setContract(res.data.data.contract);
    } catch (error: any) {
      console.error("Error fetching contract:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch order details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, toast]);

  const fetchMyWallets = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: { wallets: UserWallet[] } }>('/wallets');
      setMyWallets(res.data.data.wallets);
    } catch (err) {
      console.error("Failed to fetch wallets:", err);
    }
  }, []);

  useEffect(() => {
    fetchContract();
    fetchMyWallets();
  }, [fetchContract, fetchMyWallets]);

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

  const payMilestone = async () => {
    await apiClient.post(`/contracts/${id}/pay`);
    toast({ title: "Success", description: "Payment successful!" });
  };

  const updateMilestone = async (milestoneId: string, status: string) => {
    await apiClient.patch(`/contracts/${id}/milestones/${milestoneId}`, { status });
    toast({ title: "Success", description: "Milestone updated" });
  };

  const addTimelineItem = async () => {
    if (!timelineForm.title) return;
    setIsAddingTimeline(true);
    try {
      await apiClient.post(`/contracts/${id}/timeline`, timelineForm);
      setTimelineForm({ title: "", description: "" });
      toast({ title: "Success", description: "Timeline item added" });
      await fetchContract(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add timeline item",
        variant: "destructive"
      });
    } finally {
      setIsAddingTimeline(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard` });
  };

  const openConfirmDialog = (title: string, description: string, action: () => Promise<void>) => {
    setDialog({
      open: true,
      title,
      description,
      action: () => executeAction(action),
    });
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

  if (!contract || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Order Not Found</h2>
          <p className="text-muted-foreground mt-1">The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
        </div>
        <Button onClick={() => router.push('/dashboard/orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
      </div>
    );
  }

  const isBuyer = user.id === contract.buyerId;
  const isSeller = user.id === contract.sellerId;
  const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = statusConfig.icon;

  // Calculate progress
  const totalMilestones = contract.milestones?.length || 0;
  const completedMilestones = contract.milestones?.filter(m =>
    ['APPROVED', 'PAID'].includes(m.status)
  ).length || 0;
  const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  // Get next payable milestone
  const sortedMilestones = [...(contract.milestones || [])].sort((a, b) => a.order - b.order);
  const nextMilestone = sortedMilestones.find(m => m.status === 'PENDING');

  // Check if can pay
  const myUsdtWallet = myWallets.find(w => w.currency === 'USDT' && w.network === 'TRON');
  const canPay = nextMilestone && myUsdtWallet && parseFloat(myUsdtWallet.balance) >= parseFloat(nextMilestone.amount);

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
            onClick={() => router.push('/dashboard/orders')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Orders
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-mono text-xs">{contract.id.slice(0, 8).toUpperCase()}</span>
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

            {/* Cancel Action */}
            {['DRAFT', 'PENDING_REVIEW', 'PENDING_ACCEPTANCE'].includes(contract.status) && (isBuyer || isSeller) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openConfirmDialog(
                  "Cancel Order",
                  "Are you sure you want to cancel this order? This action cannot be undone.",
                  () => updateStatus('CANCELLED')
                )}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Order Info & Timeline */}
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Buyer</p>
                    {isBuyer && <Badge variant="secondary" className="text-[10px] h-4">You</Badge>}
                  </div>
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Seller</p>
                    {isSeller && <Badge variant="secondary" className="text-[10px] h-4">You</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{contract.seller?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{contract.seller?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Wallet */}
          {contract.contract_wallets && (
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
              {/* Add Timeline Item (Seller Only) */}
              {isSeller && !['COMPLETED', 'CANCELLED'].includes(contract.status) && (
                <div className="space-y-2 mb-4 pb-4 border-b">
                  <input
                    type="text"
                    placeholder="Update title..."
                    className="w-full h-8 px-3 text-sm rounded-md border bg-background"
                    value={timelineForm.title}
                    onChange={(e) => setTimelineForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <textarea
                    placeholder="Description..."
                    className="w-full h-16 px-3 py-2 text-sm rounded-md border bg-background resize-none"
                    value={timelineForm.description}
                    onChange={(e) => setTimelineForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!timelineForm.title || isAddingTimeline}
                    onClick={addTimelineItem}
                  >
                    {isAddingTimeline && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                    Post Update
                  </Button>
                </div>
              )}

              {/* Timeline Items */}
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

        {/* Center Column - Terms, Agreement & Chat (MAIN FOCUS) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Terms & Agreement Document */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Terms & Agreement
                </CardTitle>
                {pdfUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(pdfUrl, '_blank')}
                  >
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
        </div>

        {/* Right Column - Actions & Milestones */}
        <div className="lg:col-span-3 space-y-6">
          {/* Description */}
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

          {/* Action Cards */}
          <div className="space-y-3">
            {/* Buyer: Accept Contract */}
            {isBuyer && contract.status === 'PENDING_ACCEPTANCE' && (
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-emerald-900 text-sm mb-1">Accept Contract</h3>
                  <p className="text-xs text-emerald-700 mb-3">Review the terms and accept to proceed.</p>
                  <Button
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => openConfirmDialog(
                      "Accept Contract",
                      "Are you sure you want to accept this contract? An escrow wallet will be created.",
                      () => updateStatus('AGREED')
                    )}
                  >
                    Accept & Continue
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Buyer: Pay Milestone */}
            {isBuyer && ['AGREED', 'IN_PROGRESS'].includes(contract.status) && nextMilestone && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-orange-900 text-sm mb-1">Payment Required</h3>
                  <p className="text-xs text-orange-700 mb-3">
                    Pay {parseFloat(nextMilestone.amount).toLocaleString()} {contract.currency}
                  </p>

                  {/* External Payment */}
                  {contract.contract_wallets && (
                    <div className="mb-3">
                      <p className="text-[10px] font-medium mb-1">Escrow Address</p>
                      <div className="flex items-center gap-1">
                        <code className="text-[9px] bg-muted px-2 py-1 rounded flex-1 truncate">
                          {contract.contract_wallets.address}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(contract.contract_wallets!.address, "Address")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {/* <Button
                      size="sm"
                      variant="secondary"
                      className="w-full text-xs"
                      onClick={() => openConfirmDialog(
                        "Confirm Payment",
                        "Have you sent the funds to the escrow wallet?",
                        () => updateStatus('PAYMENT_SUBMITTED')
                      )}
                    >
                      I&apos;ve Sent Funds
                    </Button> */}

                    {canPay && (
                      <Button
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => openConfirmDialog(
                          "Confirm Payment",
                          `Pay ${parseFloat(nextMilestone.amount).toLocaleString()} USDT from your wallet?`,
                          payMilestone
                        )}
                      >
                        <Wallet className="h-3 w-3 mr-1" /> Pay Instantly
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Verification Status */}
            {contract.status === 'PAYMENT_SUBMITTED' && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    <div>
                      <h3 className="font-semibold text-blue-900 text-sm">Verification in Progress</h3>
                      <p className="text-xs text-blue-700">Admin is checking your payment...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seller: Work in Progress */}
            {isSeller && contract.status === 'IN_PROGRESS' && (
              <Card className="border-indigo-200 bg-indigo-50/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-indigo-900 text-sm mb-1">Work in Progress</h3>
                  <p className="text-xs text-indigo-700 mb-3">Complete work and submit for review.</p>
                  <Button
                    size="sm"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => openConfirmDialog(
                      "Mark as Delivered",
                      "Mark this order as delivered?",
                      () => updateStatus('DELIVERED')
                    )}
                  >
                    <Package className="h-3 w-3 mr-1" /> Mark Delivered
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Buyer: Confirm Delivery */}
            {isBuyer && contract.status === 'DELIVERY_REVIEWED' && (
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-green-900 text-sm mb-1">Confirm Delivery</h3>
                  <p className="text-xs text-green-700 mb-3">Release funds to complete the order.</p>
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => openConfirmDialog(
                      "Confirm & Release Funds",
                      "Release funds to the seller and complete the order?",
                      () => updateStatus('COMPLETED')
                    )}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Confirm & Release
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Completed Status */}
            {contract.status === 'COMPLETED' && (
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-900 text-sm">Order Completed</h3>
                      <p className="text-xs text-green-700">Successfully completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancelled/Rejected Status */}
            {['CANCELLED', 'REJECTED'].includes(contract.status) && (
              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-900 text-sm">Order {contract.status === 'CANCELLED' ? 'Cancelled' : 'Rejected'}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

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
                  <div key={milestone.id} className="p-3 rounded-lg bg-muted/30">
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

                    {/* Milestone Actions */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                      {isSeller && milestone.status === 'PAID' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => openConfirmDialog("Start Work", "Mark as in progress?", () => updateMilestone(milestone.id, 'IN_PROGRESS'))}
                        >
                          <Play className="h-3 w-3 mr-1" /> Start
                        </Button>
                      )}
                      {isSeller && milestone.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => openConfirmDialog("Submit", "Submit for review?", () => updateMilestone(milestone.id, 'SUBMISSION_REVIEW'))}
                        >
                          <Send className="h-3 w-3 mr-1" /> Submit
                        </Button>
                      )}
                      {isBuyer && milestone.status === 'SUBMITTED' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-emerald-600"
                            onClick={() => openConfirmDialog("Approve", "Approve this milestone?", () => updateMilestone(milestone.id, 'APPROVED'))}
                          >
                            <Check className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-red-600"
                            onClick={() => openConfirmDialog("Reject", "Reject this milestone?", () => updateMilestone(milestone.id, 'REJECTED'))}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" /> Reject
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
        </div>
      </div>

      {/* Floating Order Chat */}
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
