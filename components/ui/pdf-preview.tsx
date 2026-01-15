"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
    file: string | Blob | null;
    className?: string;
}

export default function PdfPreview({ file, className }: PdfPreviewProps) {
    console.log(file);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(true);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
        setIsLoading(false);
    }

    // Reset when file changes
    useEffect(() => {
        setIsLoading(true);
        setPageNumber(1);
    }, [file]);

    if (!file) {
        return <div className="flex items-center justify-center h-full text-muted-foreground p-12 bg-muted/20 border rounded-lg">No document to preview</div>;
    }

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            {/* Controls */}
            <div className="flex items-center gap-4 bg-background border p-2 rounded-md shadow-sm w-full justify-between max-w-[600px]">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                        disabled={pageNumber <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                        Page {pageNumber} of {numPages || "--"}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages || 1))}
                        disabled={pageNumber >= (numPages || 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.5))}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs w-12 text-center text-muted-foreground">
                        {Math.round(scale * 100)}%
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setScale((prev) => Math.min(prev + 0.2, 3.0))}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Viewer */}
            <div className="border rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 p-4 w-full flex justify-center min-h-[500px]">
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                            <span>Loading PDF...</span>
                        </div>
                    }
                    error={
                        <div className="flex items-center justify-center p-12 text-destructive">
                            Failed to load PDF document.
                        </div>
                    }
                    className="shadow-lg"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="bg-white"
                        width={600} // Base width for consistency
                    />
                </Document>
            </div>
        </div>
    );
}
