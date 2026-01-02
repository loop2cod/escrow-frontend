"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Download,
  FileText,
  DollarSign,
  Users
} from "lucide-react";

export interface AgreementDocument {
  title: string;
  content: string;
  metadata: {
    createdAt: string;
    parties: string[];
    amount?: string;
  };
}

interface AgreementDocumentBuilderProps {
  onChange: (document: AgreementDocument) => void;
}

const AGREEMENT_TEMPLATES = [
  {
    id: "service",
    title: "Service Agreement",
    content: `<h1>Service Agreement</h1>
<p><br></p>
<p>This Service Agreement (the "Agreement") is entered into as of [Date] by and between:</p>
<p><br></p>
<p><strong>Service Provider:</strong> [Provider Name]<br>
<strong>Address:</strong> [Provider Address]<br>
<strong>Email:</strong> [Provider Email]</p>
<p><br></p>
<p><strong>Client:</strong> [Client Name]<br>
<strong>Address:</strong> [Client Address]<br>
<strong>Email:</strong> [Client Email]</p>
<p><br></p>
<h2>1. Services</h2>
<p>The Service Provider agrees to provide the following services:</p>
<ul>
  <li>[Service description 1]</li>
  <li>[Service description 2]</li>
  <li>[Service description 3]</li>
</ul>
<p><br></p>
<h2>2. Payment Terms</h2>
<p>The total project fee is $[Amount]. Payment will be made according to the following milestones:</p>
<ul>
  <li>[Milestone 1] - [Percentage]%</li>
  <li>[Milestone 2] - [Percentage]%</li>
  <li>[Milestone 3] - [Percentage]%</li>
</ul>
<p><br></p>
<h2>3. Timeline</h2>
<p>The project shall commence on [Start Date] and is expected to be completed by [End Date].</p>
<p><br></p>
<h2>4. Deliverables</h2>
<p>The Service Provider shall deliver:</p>
<ol>
  <li>[Deliverable 1]</li>
  <li>[Deliverable 2]</li>
  <li>[Deliverable 3]</li>
</ol>
<p><br></p>
<h2>5. Terms and Conditions</h2>
<p>[Add any additional terms and conditions here]</p>
<p><br></p>
<p><br></p>
<p>____________________________<br>
Service Provider Signature</p>
<p><br></p>
<p>____________________________<br>
Client Signature</p>`
  },
  {
    id: "freelance",
    title: "Freelance Contract",
    content: `<h1>Freelance Contract</h1>
<p><br></p>
<p>This Freelance Agreement is made on [Date] between:</p>
<p><br></p>
<p><strong>Freelancer:</strong> [Your Name]</p>
<p><strong>Client:</strong> [Client Name]</p>
<p><br></p>
<h2>Scope of Work</h2>
<p>[Describe the project scope and deliverables]</p>
<p><br></p>
<h2>Compensation</h2>
<p>Total Fee: $[Amount]</p>
<p>Payment Schedule: [Payment terms]</p>
<p><br></p>
<h2>Timeline</h2>
<p>Start Date: [Date]</p>
<p>Completion Date: [Date]</p>
<p><br></p>
<h2>Intellectual Property</h2>
<p>[IP ownership terms]</p>
<p><br></p>
<h2>Signatures</h2>
<p><br></p>
<p>____________________________<br>
Freelancer</p>
<p><br></p>
<p>____________________________<br>
Client</p>`
  },
  {
    id: "blank",
    title: "Blank Document",
    content: `<h1>Escrow Agreement</h1>
<p><br></p>
<p>Start writing your agreement here...</p>`
  }
];

export function AgreementDocumentBuilder({ onChange }: AgreementDocumentBuilderProps) {
  const [title, setTitle] = useState("Escrow Agreement");
  const [content, setContent] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const [showTemplates, setShowTemplates] = useState(true);

  useEffect(() => {
    // Initialize content when editor mounts
    if (editorRef.current && !showTemplates && content) {
      editorRef.current.innerHTML = content;
    }
  }, [showTemplates, content]);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange({
        title,
        content: newContent,
        metadata: {
          createdAt: new Date().toISOString(),
          parties: [],
        }
      });
    }
  };

  const loadTemplate = (template: typeof AGREEMENT_TEMPLATES[0]) => {
    setContent(template.content);
    setShowTemplates(false);

    // Slight delay to ensure the editor is rendered
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = template.content;
        handleContentChange();
      }
    }, 0);
  };

  const downloadAsPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              color: #333;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
              text-align: center;
            }
            h2 {
              font-size: 18px;
              margin-top: 30px;
              margin-bottom: 10px;
            }
            p {
              margin-bottom: 10px;
            }
            ul, ol {
              margin-bottom: 15px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${editorRef.current?.innerHTML || ''}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const insertText = (html: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, html);
      handleContentChange();
    }
  };

  if (showTemplates) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-1">Choose a Template</h3>
          <p className="text-xs text-muted-foreground">
            Start with a template or create from scratch
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {AGREEMENT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => loadTemplate(template)}
              className="border-2 rounded-lg p-6 text-left hover:border-primary hover:bg-accent transition-all"
              type="button"
            >
              <FileText className="size-10 text-primary mb-3" />
              <p className="font-semibold text-sm mb-1">{template.title}</p>
              <p className="text-xs text-muted-foreground">
                {template.id === "blank"
                  ? "Start from scratch"
                  : "Pre-filled template"}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Agreement Document</h3>
          <p className="text-xs text-muted-foreground">
            Create your agreement document
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(true)}
            type="button"
          >
            Change Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadAsPDF}
            type="button"
            disabled={!content}
          >
            <Download className="mr-2 size-3" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="border rounded-lg p-2 bg-muted/30">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-0.5 pr-2 border-r">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => applyFormat("bold")}
              type="button"
              title="Bold"
            >
              <Bold className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => applyFormat("italic")}
              type="button"
              title="Italic"
            >
              <Italic className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => applyFormat("underline")}
              type="button"
              title="Underline"
            >
              <Underline className="size-4" />
            </Button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-0.5 pr-2 border-r">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormat("formatBlock", "h1")}
              type="button"
              title="Heading 1"
              className="text-xs"
            >
              <Heading1 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applyFormat("formatBlock", "h2")}
              type="button"
              title="Heading 2"
              className="text-xs"
            >
              <Heading2 className="size-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 pr-2 border-r">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => applyFormat("justifyLeft")}
              type="button"
              title="Align Left"
            >
              <AlignLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => applyFormat("justifyCenter")}
              type="button"
              title="Align Center"
            >
              <AlignCenter className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => applyFormat("justifyRight")}
              type="button"
              title="Align Right"
            >
              <AlignRight className="size-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => applyFormat("insertUnorderedList")}
              type="button"
              title="Bullet List"
            >
              <List className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => applyFormat("insertOrderedList")}
              type="button"
              title="Numbered List"
            >
              <ListOrdered className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="min-h-[500px] p-8 focus:outline-none
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5
            [&_p]:mb-3 [&_p]:leading-relaxed
            [&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:list-disc
            [&_ol]:mb-4 [&_ol]:ml-6 [&_ol]:list-decimal
            [&_li]:mb-1
            [&_strong]:font-semibold
            [&_em]:italic
            font-serif text-gray-900"
          style={{ fontFamily: 'Georgia, serif' }}
        />
      </div>

      {/* Quick Insert Templates */}
      <div className="border rounded-lg p-3 bg-muted/20">
        <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
          QUICK INSERT
        </Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertText('<p><strong>Party Name:</strong> [Enter name]<br><strong>Date:</strong> [Enter date]</p>')}
            type="button"
            className="text-xs"
          >
            <Users className="mr-1 size-3" />
            Party Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertText('<p><strong>Amount:</strong> $[Enter amount]</p>')}
            type="button"
            className="text-xs"
          >
            <DollarSign className="mr-1 size-3" />
            Payment Amount
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertText('<p><br></p><p>____________________________<br>Signature</p>')}
            type="button"
            className="text-xs"
          >
            <FileText className="mr-1 size-3" />
            Signature Line
          </Button>
        </div>
      </div>
    </div>
  );
}
