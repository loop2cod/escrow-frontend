"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Step1Details from "./steps/Step1Details";
import Step2Agreement from "./steps/Step2Agreement";
import Step3Milestones from "./steps/Step3Milestones";
import Step4Review from "./steps/Step4Review";

interface Milestone {
  title: string;
  description: string;
  amount: string;
}

export default function CreateContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draftId');

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellerValidation, setSellerValidation] = useState<{ valid: boolean; name?: string } | null>(null);
  const [isValidatingSeller, setIsValidatingSeller] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sellerEmail: "", // Invite Seller
    currency: "USDT",
    terms: "",
    milestones: [{ title: "", description: "", amount: "" }] as Milestone[],
  });

  // Draft State
  const [draftId, setDraftId] = useState<string | null>(null);

  useEffect(() => {
    if (draftIdParam) {
      setDraftId(draftIdParam);
      fetchDraft(draftIdParam);
    }
  }, [draftIdParam]);

  const fetchDraft = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/contracts/${id}`);
      const contract = res.data.data.contract;

      setFormData({
        title: contract.title || "",
        description: contract.description || "",
        sellerEmail: contract.seller?.email || "",
        currency: contract.currency || "USDT",
        terms: contract.terms || "",
        milestones: contract.milestones.length > 0 ? contract.milestones.map((m: any) => ({
          title: m.title,
          description: m.description,
          amount: m.amount.toString()
        })) : [{ title: "", description: "", amount: "" }]
      });

      // Determine Resume Step
      if (contract.currentStep) {
        setStep(contract.currentStep);
      } else {
        // Fallback logic
        if (!contract.terms) {
          setStep(2);
        } else if (!contract.milestones || contract.milestones.length === 0) {
          setStep(3);
        } else {
          setStep(4);
        }
      }

      // Pre-validate seller logic if exists
      if (contract.seller) {
        setSellerValidation({ valid: true, name: contract.seller.name });
      }

    } catch (err) {
      console.error("Failed to load draft", err);
      setError("Failed to load draft");
    } finally {
      setIsLoading(false);
    }
  };

  const validateSeller = async (identifier: string) => {
    try {
      setIsValidatingSeller(true);
      const res = await apiClient.post('/contracts/validate-user', { identifier });
      if (res.data.status) {
        setSellerValidation({ valid: true, name: res.data.data.user.name });
      } else {
        setSellerValidation({ valid: false });
      }
    } catch (err) {
      setSellerValidation({ valid: false });
    } finally {
      setIsValidatingSeller(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const newMilestones = [...formData.milestones];
    (newMilestones[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, milestones: newMilestones }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: "", description: "", amount: "" }]
    }));
  };

  const removeMilestone = (index: number) => {
    if (formData.milestones.length === 1) return;
    const newMilestones = [...formData.milestones];
    newMilestones.splice(index, 1);
    setFormData(prev => ({ ...prev, milestones: newMilestones }));
  };

  // Calculate total amount
  const totalAmount = formData.milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  const saveDraft = async (targetStep?: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Payload with current state
      const payload = {
        title: formData.title,
        description: formData.description,
        terms: formData.terms,
        totalAmount: totalAmount,
        currency: formData.currency,
        sellerEmail: formData.sellerEmail || null,
        milestones: formData.milestones.map(m => ({
          title: m.title,
          description: m.description,
          amount: parseFloat(m.amount) || 0
        })),
        status: 'DRAFT',
        currentStep: targetStep || step
      };

      let res;
      if (draftId) {
        // Update existing draft
        res = await apiClient.put(`/contracts/${draftId}`, payload);
      } else {
        // Create new draft
        res = await apiClient.post('/contracts', payload);
        setDraftId(res.data.data.contract.id);
      }

      // If explicitly saving (no target step), maybe show toast? For now just proceed.
      if (targetStep) {
        setStep(targetStep);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save draft");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = (nextStep: number) => {
    // Auto-save draft on step transition
    saveDraft(nextStep);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate
      if (!formData.title || !formData.description) throw new Error("Please fill in basic details");
      if (totalAmount <= 0) throw new Error("Total contract value must be greater than 0");

      if (!draftId) {
        // Should have draftId by step 4 if we auto-saved, but handling edge case
        await saveDraft();
      }

      // Finalize Status
      if (draftId) {
        await apiClient.put(`/contracts/${draftId}`, { status: 'PENDING_ACCEPTANCE' }); // Or whatever the active status is
      } else {
        // Fallback if saveDraft failed to set ID? (Unlikely)
        throw new Error("Draft ID missing");
      }

      router.push('/dashboard/orders');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create contract");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pt-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Contract</h1>
          <p className="text-sm text-muted-foreground">Create a new milestone-based escrow contract.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {/* STEP 1: Basic Details */}
      {step === 1 && (
        <Step1Details
          formData={formData}
          updateFormData={updateFormData}
          setStep={handleNextStep}
          sellerValidation={sellerValidation}
          validateSeller={validateSeller}
          setSellerValidation={setSellerValidation}
          isValidatingSeller={isValidatingSeller}
        />
      )}

      {/* STEP 2: Agreement Manager */}
      {step === 2 && (
        <Step2Agreement
          formData={formData}
          updateFormData={updateFormData}
          setStep={handleNextStep}
          onSaveDraft={() => saveDraft()}
          isLoading={isLoading}
        />
      )}

      {/* STEP 3: Milestones */}
      {step === 3 && (
        <Step3Milestones
          formData={formData}
          updateMilestone={updateMilestone}
          addMilestone={addMilestone}
          removeMilestone={removeMilestone}
          totalAmount={totalAmount}
          setStep={handleNextStep}
        />
      )}

      {/* STEP 4: Review */}
      {step === 4 && (
        <Step4Review
          formData={formData}
          totalAmount={totalAmount}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          setStep={setStep}
        />
      )}
    </div>
  );
}
