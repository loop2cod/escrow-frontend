"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Download } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import PdfPreview from "@/components/ui/pdf-preview";

interface Step4Props {
    formData: any;
    totalAmount: number;
    handleSubmit: () => void;
    isLoading: boolean;
    setStep: (step: number) => void;
}

export default function Step4Review({
    formData,
    totalAmount,
    handleSubmit,
    isLoading,
    setStep
}: Step4Props) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(true);
    const lastBlobUrlRef = useRef<string | null>(null);

    useEffect(() => {
        let active = true;

        const generatePdfBlob = async () => {
            try {
                if (active) setIsGeneratingPdf(true);
                // Generate PDF using @react-pdf/renderer
                const { pdf } = await import('@react-pdf/renderer');
                const { ContractPdfDocument } = await import('./Step4PdfDocument');

                console.log("Generating Vector PDF...");

                const blob = await pdf(
                    <ContractPdfDocument
                        title={formData.title}
                        description={formData.description}
                        terms={formData.terms}
                        date={new Date().toLocaleDateString()}
                    />
                ).toBlob();

                if (!active) return;

                const url = URL.createObjectURL(blob);

                // Cleanup previous blob URL to prevent leaks
                if (lastBlobUrlRef.current) {
                    URL.revokeObjectURL(lastBlobUrlRef.current);
                }
                lastBlobUrlRef.current = url;
                setPdfUrl(url);

            } catch (err) {
                console.error("Failed to generate PDF preview", err);
            } finally {
                if (active) setIsGeneratingPdf(false);
            }
        };

        // Generate immediately on mount/data change
        generatePdfBlob();

        return () => {
            active = false;
            // We don't revoke here immediately because we might want to keep showing the pdf 
            // while next one generates? No, usually fine.
            // But if we unmount, we certainly want to revoke.
            // If we re-run, the next run will revoke the old ref.
            // BUT: if we re-run, 'active' becomes false. The 'return' runs.
            // Does the return run BEFORE the next effect body? Yes.
            // So we can strictly clean up here if we want?
            // Actually, better to let the next run clean up the previous ref, or clean up here.
            // If we clean up here, the PDF might flicker to blank?
            // "Viewer" uses the `pdfUrl` state.
            // If we unmount, clean up.
        };
    }, [formData.terms, formData.title, formData.description]);

    // Separate cleanup on unmount only
    useEffect(() => {
        return () => {
            if (lastBlobUrlRef.current) {
                URL.revokeObjectURL(lastBlobUrlRef.current);
            }
        };
    }, []);

    const handleDownloadPdf = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${formData.title.replace(/\s+/g, '_')}_Agreement.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Review & Create</CardTitle>
                <CardDescription>Verify details before creating the contract.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Contract Title:</span>
                        <div className="font-medium">{formData.title}</div>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Total Amount:</span>
                        <div className="font-medium text-lg">{totalAmount.toFixed(2)} USDT</div>
                    </div>
                    <div className="col-span-2">
                        <span className="text-muted-foreground">Description:</span>
                        <div className="mt-1 p-3 rounded-md bg-muted/50 max-h-[100px] overflow-auto">{formData.description}</div>
                    </div>

                    {/* Agreement / PDF Preview Section */}
                    <div className="col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">Agreement Document</span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2"
                                onClick={handleDownloadPdf}
                                disabled={!pdfUrl || isGeneratingPdf}
                            >
                                <Download className="h-4 w-4" /> Download PDF
                            </Button>
                        </div>

                        {/* PDF Viewer */}
                        <div className="min-h-[500px]">
                            {isGeneratingPdf ? (
                                <div className="flex flex-col items-center justify-center h-[500px] bg-muted/10 border rounded-lg">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                    <span className="text-muted-foreground">Generating Agreement Preview...</span>
                                </div>
                            ) : (
                                <PdfPreview file={pdfUrl} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Milestones Schedule</h4>
                    {formData.milestones.map((m: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm p-2 rounded border-b last:border-0 hover:bg-muted/30">
                            <div className="flex gap-2">
                                <span className="font-mono text-muted-foreground">{i + 1}.</span>
                                <span>{m.title || "Untitled Milestone"}</span>
                            </div>
                            <div className="font-medium">{parseFloat(m.amount).toFixed(2)} USDT</div>
                        </div>
                    ))}
                </div>
                <div className="rounded-md border p-3 flex items-start gap-3 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                        By creating this contract, you agree to the platform rules. The seller will be invited to review and accept these terms before the contract becomes active.
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={handleSubmit} disabled={isLoading} className="min-w-[140px]">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Contract <CheckCircle2 className="ml-2 h-4 w-4" /></>}
                </Button>
            </CardFooter>
        </Card>
    );
}
