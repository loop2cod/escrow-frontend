"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, FileText, Upload, AlertCircle } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';

interface Step2Props {
    formData: any;
    updateFormData: (field: string, value: any) => void;
    setStep: (step: number) => void;
    onSaveDraft: () => void;
    isLoading: boolean;
}

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const TEMPLATES = {
    "blank": "",

    "general": `<h3 class=\"ql-align-center\"><strong>PROFESSIONAL SERVICES AGREEMENT</strong></h3>
<p><br/></p>
<h4><strong>1. SCOPE OF SERVICES</strong></h4>
<p>The Service Provider (Seller) agrees to deliver all services outlined in the attached Project Milestones with professional expertise, reasonable care, and in accordance with industry-standard best practices. All deliverables shall meet the specifications and quality standards described in the project documentation.</p>
<p><br/></p>
<h4><strong>2. PAYMENT STRUCTURE & ESCROW</strong></h4>
<p>The Client (Buyer) agrees to deposit the full contract value into the Platform's secure Escrow account prior to project commencement. Payment shall be released to the Service Provider upon:</p>
<ul>
<li>Satisfactory completion of each designated Milestone as verified by the Client</li>
<li>Submission of all required deliverables in the agreed format</li>
<li>Client approval, which shall not be unreasonably withheld</li>
</ul>
<p>Partial releases may be processed for completed Milestones while subsequent phases remain in progress.</p>
<p><br/></p>
<h4><strong>3. PROJECT TIMELINE & MODIFICATIONS</strong></h4>
<p>The Service Provider shall adhere to the timeline specified in each Milestone. Any anticipated delays must be communicated promptly with reasonable justification. Changes to project scope, timeline, or deliverables must be mutually agreed upon in writing and may result in timeline extensions or fee adjustments.</p>
<p><br/></p>
<h4><strong>4. CONFIDENTIALITY & NON-DISCLOSURE</strong></h4>
<p>Both parties acknowledge that during the course of this engagement, they may have access to proprietary information, trade secrets, business strategies, technical data, and other confidential materials. Each party agrees to:</p>
<ul>
<li>Maintain strict confidentiality of all shared information</li>
<li>Use confidential information solely for purposes of fulfilling this Agreement</li>
<li>Not disclose such information to third parties without prior written consent</li>
<li>Return or destroy confidential materials upon project completion or termination</li>
</ul>
<p>This obligation survives termination of this Agreement for a period of three (3) years.</p>
<p><br/></p>
<h4><strong>5. QUALITY ASSURANCE & ACCEPTANCE</strong></h4>
<p>The Client shall have a reasonable period (not to exceed 7 business days unless otherwise specified) to review and test each Milestone deliverable. Feedback must be provided in a timely, specific, and constructive manner. Approval shall be granted once deliverables meet the agreed specifications.</p>
<p><br/></p>
<h4><strong>6. DISPUTE RESOLUTION & MEDIATION</strong></h4>
<p>In the event of any disagreement, conflict, or claim arising from this Agreement, both parties agree to:</p>
<ul>
<li>First attempt good-faith negotiation to resolve the matter directly</li>
<li>Engage the Platform's dispute resolution service if direct negotiation fails</li>
<li>Provide all relevant documentation and evidence to support their position</li>
<li>Accept the Platform's final determination as binding</li>
</ul>
<p><br/></p>
<h4><strong>7. TERMINATION</strong></h4>
<p>Either party may terminate this Agreement with written notice if the other party materially breaches its obligations and fails to cure such breach within 14 days of notification. Upon termination, the Service Provider shall be compensated for all completed and accepted work according to the Milestone structure.</p>
<p><br/></p>
<h4><strong>8. LIMITATION OF LIABILITY</strong></h4>
<p>Except in cases of willful misconduct or gross negligence, neither party shall be liable for indirect, incidental, consequential, or punitive damages. Total liability under this Agreement shall not exceed the total contract value.</p>`,

    "development": `<h3 class=\"ql-align-center\"><strong>SOFTWARE DEVELOPMENT & ENGINEERING AGREEMENT</strong></h3>
<p><br/></p>
<h4><strong>1. DEVELOPMENT SCOPE & SPECIFICATIONS</strong></h4>
<p>The Developer (Seller) agrees to design, develop, test, and deliver software solutions as comprehensively detailed in the Project Description, Technical Specifications, and Milestone breakdown. This includes:</p>
<ul>
<li>Analysis and planning of technical architecture</li>
<li>Implementation of all specified features and functionalities</li>
<li>Unit testing, integration testing, and quality assurance</li>
<li>Documentation including code comments, API documentation, and user guides where applicable</li>
<li>Deployment assistance and knowledge transfer as specified</li>
</ul>
<p><br/></p>
<h4><strong>2. INTELLECTUAL PROPERTY & OWNERSHIP RIGHTS</strong></h4>
<p>Upon receipt of full and final payment, all intellectual property rights including but not limited to source code, object code, executables, databases, algorithms, technical documentation, design files, and related materials shall transfer exclusively to the Client (Buyer). The Developer:</p>
<ul>
<li>Relinquishes all ownership, copyright, and derivative work rights</li>
<li>Grants the Client unlimited rights to modify, distribute, sublicense, and commercialize the software</li>
<li>Warrants that the delivered work is original or properly licensed and does not infringe third-party rights</li>
<li>May retain portfolio rights to display the project (excluding confidential details) only with explicit written permission</li>
</ul>
<p><br/></p>
<h4><strong>3. DEVELOPMENT STANDARDS & BEST PRACTICES</strong></h4>
<p>The Developer agrees to adhere to industry-standard coding practices including:</p>
<ul>
<li>Clean, readable, and well-documented code</li>
<li>Secure coding practices and vulnerability prevention</li>
<li>Version control with regular commits and meaningful messages</li>
<li>Responsive design principles (where applicable)</li>
<li>Cross-browser/cross-platform compatibility as specified</li>
<li>Performance optimization and scalability considerations</li>
</ul>
<p><br/></p>
<h4><strong>4. TESTING, ACCEPTANCE & VALIDATION</strong></h4>
<p>For each Milestone delivery, the Client shall conduct acceptance testing within 7 business days. The testing period may include:</p>
<ul>
<li>Functional verification against specifications</li>
<li>User acceptance testing (UAT)</li>
<li>Performance and load testing where applicable</li>
<li>Security assessment</li>
</ul>
<p>The Client shall provide detailed feedback identifying any defects or deviations from specifications. Approval shall not be unreasonably withheld once the deliverable substantially conforms to agreed requirements.</p>
<p><br/></p>
<h4><strong>5. WARRANTY & POST-DELIVERY SUPPORT</strong></h4>
<p>The Developer warrants that the software will:</p>
<ul>
<li>Function substantially in accordance with specifications for 30 days following final delivery</li>
<li>Be free from critical bugs and defects that prevent core functionality</li>
<li>Comply with all technical requirements outlined in the agreement</li>
</ul>
<p>During the 30-day warranty period, the Developer shall fix critical bugs and errors at no additional cost. Warranty coverage includes debugging and patches but excludes new features, enhancements, or issues caused by Client modifications or third-party integrations.</p>
<p><br/></p>
<h4><strong>6. THIRD-PARTY COMPONENTS & DEPENDENCIES</strong></h4>
<p>The Developer shall disclose all third-party libraries, frameworks, APIs, and dependencies incorporated into the software. The Developer warrants that all such components are:</p>
<ul>
<li>Properly licensed for the intended use</li>
<li>Compatible with the project requirements</li>
<li>Documented with version information and licensing terms</li>
</ul>
<p><br/></p>
<h4><strong>7. SOURCE CODE DELIVERY & DOCUMENTATION</strong></h4>
<p>Upon project completion, the Developer shall provide:</p>
<ul>
<li>Complete, buildable source code with all project files</li>
<li>Database schemas, migration scripts, and seed data where applicable</li>
<li>Configuration files and environment setup instructions</li>
<li>Technical documentation including architecture diagrams and API references</li>
<li>Deployment guides and server requirements</li>
<li>Administrator and user manuals as specified</li>
</ul>
<p><br/></p>
<h4><strong>8. CHANGE REQUESTS & SCOPE MODIFICATIONS</strong></h4>
<p>Requests for features or modifications outside the original scope must be documented in writing. Such changes may require:</p>
<ul>
<li>Additional timeline allocation</li>
<li>Supplementary fees based on complexity</li>
<li>Formal amendment to the Milestone structure</li>
<li>Mutual written agreement before implementation</li>
</ul>`,

    "design": `<h3 class=\"ql-align-center\"><strong>CREATIVE DESIGN & BRANDING SERVICES AGREEMENT</strong></h3>
<p><br/></p>
<h4><strong>1. CREATIVE DELIVERABLES & SPECIFICATIONS</strong></h4>
<p>The Designer (Seller) agrees to create, develop, and deliver all creative assets as outlined in the Project Milestones. Deliverables include:</p>
<ul>
<li>Concept development and initial design mockups</li>
<li>Final production-ready design files in source formats (AI, PSD, SKETCH, FIGMA, etc.)</li>
<li>Exported assets in all required formats (PNG, JPG, SVG, PDF, etc.)</li>
<li>Color specifications, typography details, and brand guidelines where applicable</li>
<li>Print-ready files with appropriate resolution and color profiles (CMYK for print, RGB for digital)</li>
<li>Responsive variations for different screen sizes (if applicable)</li>
</ul>
<p><br/></p>
<h4><strong>2. CREATIVE PROCESS & COLLABORATION</strong></h4>
<p>The Designer shall:</p>
<ul>
<li>Conduct discovery sessions to understand brand identity, target audience, and project objectives</li>
<li>Present initial concepts for Client review and feedback</li>
<li>Incorporate constructive feedback in a timely manner</li>
<li>Maintain regular communication throughout the design process</li>
<li>Provide design rationale and strategic recommendations</li>
</ul>
<p>The Client agrees to provide timely, specific, and actionable feedback to ensure project progression.</p>
<p><br/></p>
<h4><strong>3. REVISION & REFINEMENT POLICY</strong></h4>
<p>The agreed project fee includes up to two (2) rounds of reasonable revisions per Milestone. Revisions are defined as refinements to the existing design direction including:</p>
<ul>
<li>Color palette adjustments</li>
<li>Typography modifications</li>
<li>Layout refinements</li>
<li>Minor content adjustments</li>
<li>Element repositioning or resizing</li>
</ul>
<p>Major structural changes, complete design overhauls, new concepts, or scope expansion beyond the original brief may require additional fees and timeline extensions, to be agreed upon in writing before implementation.</p>
<p><br/></p>
<h4><strong>4. INTELLECTUAL PROPERTY & USAGE RIGHTS</strong></h4>
<p>Upon receipt of full and final payment, the Designer grants the Client an exclusive, perpetual, worldwide, royalty-free license to:</p>
<ul>
<li>Reproduce, display, and distribute the Work in any medium</li>
<li>Modify and create derivative works based on the original design</li>
<li>Use the design for commercial purposes without restriction</li>
<li>Transfer rights to third parties as needed</li>
</ul>
<p>The Designer retains the right to:</p>
<ul>
<li>Display the work in their professional portfolio</li>
<li>Use the project as a case study (excluding confidential business information)</li>
<li>Reference the project in promotional materials</li>
</ul>
<p>If the Client requires complete confidentiality or wishes to restrict portfolio usage, this must be specified and agreed upon prior to project commencement.</p>
<p><br/></p>
<h4><strong>5. ORIGINAL WORK & ATTRIBUTION</strong></h4>
<p>The Designer warrants that:</p>
<ul>
<li>All delivered work is original or uses properly licensed assets</li>
<li>No copyrighted materials, trademarks, or proprietary elements are used without authorization</li>
<li>Stock images, fonts, icons, or other third-party resources are properly licensed for commercial use</li>
<li>The Client will receive documentation of all licenses for third-party assets</li>
</ul>
<p>The Designer shall indemnify the Client against claims of copyright infringement arising from unauthorized use of materials provided by the Designer.</p>
<p><br/></p>
<h4><strong>6. STOCK ASSETS & LICENSING</strong></h4>
<p>If stock photography, illustrations, fonts, or other licensed elements are incorporated:</p>
<ul>
<li>The Designer shall disclose all licensed assets and their usage terms</li>
<li>Standard licenses are included in the project fee unless premium or extended licenses are required</li>
<li>The Client is responsible for ongoing license compliance and renewals where applicable</li>
<li>Custom illustration or photography creation may be recommended and quoted separately</li>
</ul>
<p><br/></p>
<h4><strong>7. BRAND CONSISTENCY & STYLE GUIDELINES</strong></h4>
<p>For branding projects, the Designer shall develop comprehensive style guidelines including:</p>
<ul>
<li>Logo usage rules (clear space, minimum sizes, improper usage examples)</li>
<li>Color palette with HEX, RGB, CMYK, and Pantone values</li>
<li>Typography specifications (primary and secondary fonts, hierarchy)</li>
<li>Visual language and design patterns</li>
<li>Application examples across various media</li>
</ul>
<p><br/></p>
<h4><strong>8. FILE DELIVERY & FORMAT STANDARDS</strong></h4>
<p>Final deliverables shall be organized and delivered via the Platform or agreed file transfer method, including:</p>
<ul>
<li>Layered source files with properly named and organized layers</li>
<li>Vector formats for logos and scalable graphics (AI, SVG, EPS)</li>
<li>Raster formats in appropriate resolutions (300 DPI for print, optimized for web)</li>
<li>All required file format variations as specified</li>
<li>Font files (where licensing permits) or font purchase links</li>
<li>Color profile information and print specifications</li>
</ul>
<p><br/></p>
<h4><strong>9. DESIGN APPROVAL & SIGN-OFF</strong></h4>
<p>The Client shall review each Milestone within 5 business days and provide either:</p>
<ul>
<li>Approval to proceed to the next phase</li>
<li>Specific, detailed feedback for revisions (within the agreed revision allowance)</li>
</ul>
<p>Once final designs are approved and delivered, additional changes may be subject to separate fees unless critical errors are identified.</p>`
};

export default function Step2Agreement({ formData, updateFormData, setStep, onSaveDraft, isLoading }: Step2Props) {
    const [mode, setMode] = useState<"builder" | "upload">("builder");

    const handleTemplateChange = (value: string) => {
        if (value in TEMPLATES) {
            updateFormData('terms', TEMPLATES[value as keyof typeof TEMPLATES]);
        }
    };

    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean'],
            ['undo', 'redo'],
            [{ 'align': [] }],
        ],
    }), []);

    return (
        <Card className="h-full flex flex-col shadow-md">
            <CardHeader className="pb-4">
                <CardTitle>Agreement Manager</CardTitle>
                <CardDescription>Draft your contract terms using our professional builder.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
                {/* Mode Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => setMode("builder")}
                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${mode === "builder" ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-primary/50 hover:bg-muted/50"}`}
                    >
                        <FileText className={`h-6 w-6 ${mode === "builder" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-medium ${mode === "builder" ? "text-primary" : "text-muted-foreground"}`}>Digital Builder</span>
                    </div>
                    <div
                        onClick={() => setMode("upload")}
                        className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${mode === "upload" ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-primary/50 hover:bg-muted/50"}`}
                    >
                        <Upload className={`h-6 w-6 ${mode === "upload" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-medium ${mode === "upload" ? "text-primary" : "text-muted-foreground"}`}>Upload PDF</span>
                    </div>
                </div>

                {/* Builder Mode */}
                {mode === "builder" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Load Template</Label>
                            <Select onValueChange={handleTemplateChange}>
                                <SelectTrigger className="w-[220px] h-9 text-xs">
                                    <SelectValue placeholder="Select a template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="blank">Blank Template</SelectItem>
                                    <SelectItem value="general">Professional Services</SelectItem>
                                    <SelectItem value="development">Software Development</SelectItem>
                                    <SelectItem value="design">Creative Design</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="terms" className="sr-only">Terms & Conditions</Label>
                            <div className="rounded-md overflow-hidden bg-background">
                                <style jsx global>{`
                                    .ql-container.ql-snow { border: 1px solid hsl(var(--input)) !important; border-radius: 0 0 0.5rem 0.5rem; font-size: 14px; }
                                    .ql-toolbar.ql-snow { border: 1px solid hsl(var(--input)) !important; border-bottom: none !important; border-radius: 0.5rem 0.5rem 0 0; background-color: hsl(var(--muted)/0.3); }
                                    .ql-editor { min-height: 400px; }
                                `}</style>
                                <ReactQuill
                                    theme="snow"
                                    value={formData.terms}
                                    onChange={(value) => updateFormData('terms', value)}
                                    modules={modules}
                                    placeholder="Draft your agreement terms here..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Mode (Maintenance) */}
                {mode === "upload" && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in slide-in-from-top-2 border rounded-lg bg-muted/10 border-dashed">
                        <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <h3 className="font-medium">Under Maintenance</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            PDF upload functionality is currently being upgraded. Please use the <strong>Digital Builder</strong> to create your contract for now.
                        </p>
                        <Button variant="outline" size="sm" onClick={() => setMode("builder")} className="mt-2">
                            Switch to Builder
                        </Button>
                    </div>
                )}

            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onSaveDraft} disabled={isLoading}>
                        Save as Draft
                    </Button>
                    <Button
                        onClick={() => setStep(3)}
                        disabled={mode === "upload" || !formData.terms || formData.terms === "<p><br></p>" || isLoading}
                    >
                        Next: Milestones <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
