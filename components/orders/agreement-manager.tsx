"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgreementUpload } from "./agreement-upload";
import { AgreementDocumentBuilder, AgreementDocument } from "./agreement-document-builder";
import { Upload, FileEdit } from "lucide-react";

export interface AgreementData {
  type: "upload" | "document";
  file?: File | null;
  document?: AgreementDocument;
}

interface AgreementManagerProps {
  onChange: (data: AgreementData) => void;
}

export function AgreementManager({ onChange }: AgreementManagerProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "document">("document");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [document, setDocument] = useState<AgreementDocument | undefined>();

  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
    onChange({
      type: "upload",
      file,
    });
  };

  const handleDocumentChange = (doc: AgreementDocument) => {
    setDocument(doc);
    onChange({
      type: "document",
      document: doc,
    });
  };

  const handleTabChange = (value: string) => {
    const newTab = value as "upload" | "document";
    setActiveTab(newTab);

    // Notify parent of current data when switching tabs
    if (newTab === "upload") {
      onChange({
        type: "upload",
        file: uploadedFile,
      });
    } else {
      onChange({
        type: "document",
        document,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agreement Document</CardTitle>
        <CardDescription>
          Upload an existing PDF or create a new agreement document
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="document" className="gap-2">
              <FileEdit className="size-4" />
              Create Document
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="size-4" />
              Upload PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="document" className="mt-6">
            <AgreementDocumentBuilder onChange={handleDocumentChange} />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Upload Existing Agreement</h4>
                <p className="text-xs text-muted-foreground">
                  Upload a pre-made agreement document in PDF format. Both parties will need to review and approve it.
                </p>
              </div>
              <AgreementUpload onFileChange={handleFileChange} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
