"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

interface Step1Props {
    formData: any;
    updateFormData: (field: string, value: any) => void;
    setStep: (step: number) => void;
    sellerValidation: { valid: boolean; name?: string } | null;
    validateSeller: (identifier: string) => void;
    setSellerValidation: (val: any) => void;
    isValidatingSeller: boolean;
}

export default function Step1Details({
    formData,
    updateFormData,
    setStep,
    sellerValidation,
    validateSeller,
    setSellerValidation,
    isValidatingSeller
}: Step1Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Contract Details</CardTitle>
                <CardDescription>Define the scope and currency of the agreement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Contract Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g. Website Redesign Project"
                        value={formData.title}
                        onChange={(e) => updateFormData('title', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea
                        id="desc"
                        placeholder="Describe the scope of work..."
                        className="min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                    />
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="seller">Seller Email or User ID (Required)</Label>
                        <div className="relative">
                            <Input
                                id="seller"
                                placeholder="Enter email or User ID..."
                                value={formData.sellerEmail}
                                onChange={(e) => {
                                    updateFormData('sellerEmail', e.target.value);
                                    setSellerValidation(null);
                                }}
                                onBlur={() => {
                                    if (formData.sellerEmail) validateSeller(formData.sellerEmail);
                                }}
                                className={sellerValidation?.valid ? "border-green-500 pr-10" : sellerValidation?.valid === false ? "border-destructive pr-10" : ""}
                            />
                            {isValidatingSeller && (
                                <div className="absolute right-3 top-2.5">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            {!isValidatingSeller && sellerValidation?.valid && (
                                <div className="absolute right-3 top-2.5 text-green-500">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                        {sellerValidation?.valid ? (
                            <p className="text-[10px] text-green-600">User found: {sellerValidation.name}</p>
                        ) : sellerValidation?.valid === false ? (
                            <p className="text-[10px] text-destructive">User not found. Please check the email or ID.</p>
                        ) : (
                            <p className="text-[10px] text-muted-foreground">We'll verify this user exists.</p>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.title || !formData.description || !formData.sellerEmail || sellerValidation?.valid === false || isValidatingSeller}
                >
                    Next: Agreement <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
