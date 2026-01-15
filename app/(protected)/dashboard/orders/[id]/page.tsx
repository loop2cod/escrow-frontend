"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import apiClient from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, AlertCircle, FileText, ArrowLeft, Download } from "lucide-react";
import PdfPreview from "@/components/ui/pdf-preview";
import { ContractPdfDocument } from "../create/steps/Step4PdfDocument";
import { pdf } from '@react-pdf/renderer';

interface Milestone {
    id: string;
    title: string;
    description: string;
    amount: string;
    status: string;
    order: number;
}

interface Contract {
    id: string;
    title: string;
    description: string;
    terms: string;
    totalAmount: string;
    currency: string;
    status: 'DRAFT' | 'PENDING_ACCEPTANCE' | 'AGREED' | 'FUNDED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
    buyerId: string;
    sellerId: string;
    buyer: { name: string; email: string };
    seller: { name: string; email: string };
    milestones: Milestone[];
    createdAt: string;
}

export default function ContractDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuthStore();

    const [contract, setContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const lastBlobUrlRef = useRef<string | null>(null);

    // Fetch Contract Details
    useEffect(() => {
        const fetchContract = async () => {
            if (!id) return;

            try {
                // Using apiClient with relative path, headers handled automatically
                const res = await apiClient.get<{ data: { contract: Contract } }>(`/contracts/${id}`);
                setContract(res.data.data.contract);
            } catch (error) {
                console.error("Error fetching contract:", error);
            } finally {
                setIsLoading(false);
            }
        };

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

    const handleStatusUpdate = async (status: string) => {
        if (!confirm(`Are you sure you want to ${status} this contract?`)) return;

        setActionLoading(true);
        try {
            const res = await apiClient.patch<{ data: { contract: Contract } }>(`/contracts/${id}/status`, { status });
            setContract(res.data.data.contract);
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update contract status");
        } finally {
            setActionLoading(false);
        }
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

    const isBuyer = user.id === contract.buyerId; // Fix: apiClient returns user.id usually, check type
    const isSeller = user.id === contract.sellerId;

    return (
        <div className="container mx-auto py-8 max-w-6xl space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/orders')} className="-ml-2">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                        <Badge variant={contract.status === 'AGREED' ? "default" : "secondary"} className="uppercase">
                            {contract.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{contract.title}</h1>
                    <p className="text-muted-foreground text-sm">Created on {new Date(contract.createdAt).toLocaleDateString()} • ID: {contract.id}</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Buyer Actions */}
                    {isBuyer && contract.status === 'PENDING_ACCEPTANCE' && (
                        <Button
                            variant="destructive"
                            disabled={actionLoading}
                            onClick={() => handleStatusUpdate('CANCELLED')}
                        >
                            Cancel Contract
                        </Button>
                    )}

                    {/* Seller Actions */}
                    {isSeller && contract.status === 'PENDING_ACCEPTANCE' && (
                        <>
                            <Button
                                variant="outline"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                disabled={actionLoading}
                                onClick={() => handleStatusUpdate('REJECTED')}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={actionLoading}
                                onClick={() => handleStatusUpdate('AGREED')}
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Accept Agreement
                            </Button>
                        </>
                    )}

                    {/* Common Actions */}
                    {contract.status === 'AGREED' && (
                        <Button variant="outline" onClick={() => window.open(pdfUrl || '', '_blank')} disabled={!pdfUrl}>
                            <Download className="h-4 w-4 mr-2" /> Download PDF
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Agreement View */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="flex flex-col overflow-hidden py-0 rounded">
                        <CardHeader className="bg-muted/30 border-b py-3 px-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-sm">Contract Document</span>
                            </div>
                            {isGeneratingPdf && <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Generating Preview...</span>}
                        </CardHeader>
                        <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/10 relative overflow-hidden">
                            {pdfUrl ? (
                                <PdfPreview file={pdfUrl} />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Summary & Milestones */}
                <div className="space-y-6">
                    {/* Summary Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Contract Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm font-medium text-muted-foreground">Total Value</span>
                                <span className="text-xl font-bold font-mono">{parseFloat(contract.totalAmount).toLocaleString()} {contract.currency}</span>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Buyer</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                            {contract.buyer?.name?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{contract.buyer?.name || "Unknown Buyer"}</p>
                                            <p className="text-xs text-muted-foreground">{contract.buyer?.email || "No Email"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Seller</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                                            {contract.seller?.name?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{contract.seller?.name || "Unknown Seller"}</p>
                                            <p className="text-xs text-muted-foreground">{contract.seller?.email || "No Email"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Milestones Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Project Milestones</CardTitle>
                            <CardDescription>{(contract.milestones || []).length} Phases defined</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {(contract.milestones || []).map((milestone) => (
                                    <div key={milestone.id} className="p-4 hover:bg-muted/20 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-medium text-sm">#{milestone.order} {milestone.title}</h4>
                                            <span className="font-mono text-sm font-semibold">{parseFloat(milestone.amount).toLocaleString()} {contract.currency}</span>
                                        </div>
                                        {milestone.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">{milestone.description}</p>
                                        )}
                                        <div className="mt-2 flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] h-5">{milestone.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        {contract.status === 'AGREED' && (
                            <CardFooter className="pt-4 border-t bg-muted/20">
                                <Button className="w-full" disabled>Fund First Milestone (Coming Soon)</Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
