"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Step1Details from "../../create/steps/Step1Details";
import Step2Agreement from "../../create/steps/Step2Agreement";
import Step3Milestones from "../../create/steps/Step3Milestones";
import Step4Review from "../../create/steps/Step4Review";

interface Milestone {
  title: string;
  description: string;
  amount: string;
}

export default function EditContractPage() {
  const router = useRouter();
  const { id } = useParams();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buyerValidation, setBuyerValidation] = useState<{ valid: boolean; name?: string } | null>(null);
  const [isValidatingBuyer, setIsValidatingBuyer] = useState(false);
  const [contractStatus, setContractStatus] = useState<string | null>(null);
  const [changeNote, setChangeNote] = useState("");

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buyerEmail: "",
    currency: "USDT",
    terms: "",
    milestones: [{ title: "", description: "", amount: "" }] as Milestone[],
  });

  useEffect(() => {
    if (id) {
      fetchContract(id as string);
    }
  }, [id]);

  const fetchContract = async (contractId: string) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/contracts/${contractId}`);
      const contract = res.data.data.contract;

      // Check if contract is editable (all except COMPLETED)
      const editableStatuses = ['DRAFT', 'PENDING_REVIEW', 'PENDING_ACCEPTANCE', 'AGREED', 'PAYMENT_SUBMITTED', 'IN_PROGRESS', 'DELIVERED', 'DELIVERY_REVIEWED', 'DISPUTED', 'CANCELLED', 'REJECTED'];
      if (!editableStatuses.includes(contract.status)) {
        setError(`This contract cannot be edited in ${contract.status} status.`);
        setContractStatus(contract.status);
        return;
      }

      setContractStatus(contract.status);
      setFormData({
        title: contract.title || "",
        description: contract.description || "",
        buyerEmail: contract.buyer?.email || "",
        currency: contract.currency || "USDT",
        terms: contract.terms || "",
        milestones: contract.milestones.length > 0 ? contract.milestones.map((m: any) => ({
          title: m.title,
          description: m.description || "",
          amount: m.amount.toString()
        })) : [{ title: "", description: "", amount: "" }]
      });

      // Pre-validate buyer
      if (contract.buyer) {
        setBuyerValidation({ valid: true, name: contract.buyer.name });
      }

    } catch (err: any) {
      console.error("Failed to load contract", err);
      setError(err.response?.data?.message || "Failed to load contract");
    } finally {
      setIsLoading(false);
    }
  };

  const validateBuyer = async (identifier: string) => {
    try {
      setIsValidatingBuyer(true);
      const res = await apiClient.post('/contracts/validate-user', { identifier });
      if (res.data.status) {
        setBuyerValidation({ valid: true, name: res.data.data.user.name });
      } else {
        setBuyerValidation({ valid: false });
      }
    } catch (err) {
      setBuyerValidation({ valid: false });
    } finally {
      setIsValidatingBuyer(false);
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

  const handleNextStep = (nextStep: number) => {
    setStep(nextStep);
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Validate
      if (!formData.title || !formData.description) throw new Error("Please fill in basic details");
      if (totalAmount <= 0) throw new Error("Total contract value must be greater than 0");

      const payload = {
        title: formData.title,
        description: formData.description,
        terms: formData.terms,
        totalAmount: totalAmount,
        currency: formData.currency,
        buyerEmail: formData.buyerEmail || null,
        milestones: formData.milestones.map(m => ({
          title: m.title,
          description: m.description,
          amount: parseFloat(m.amount) || 0
        })),
        changeNote: changeNote || undefined
      };

      await apiClient.put(`/contracts/${id}/edit`, payload);

      router.push(`/dashboard/orders/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || err.response?.data?.message || "Failed to update contract");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error && contractStatus && contractStatus === 'COMPLETED') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cannot Edit Contract</h2>
          <p className="text-muted-foreground mt-1">{error}</p>
        </div>
        <Link href={`/dashboard/orders/${id}`}>
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Contract
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/orders/${id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Contract</h1>
          <p className="text-sm text-muted-foreground">Update your contract details. Changes will create a new version.</p>
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

      {/* Change Note Input */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <label className="text-sm font-medium mb-2 block">Change Note (Optional)</label>
        <input
          type="text"
          placeholder="Describe what you changed..."
          className="w-full h-10 px-3 text-sm rounded-md border bg-background"
          value={changeNote}
          onChange={(e) => setChangeNote(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">This note will be saved with the version history.</p>
      </div>

      {/* STEP 1: Basic Details */}
      {step === 1 && (
        <Step1Details
          formData={formData}
          updateFormData={updateFormData}
          setStep={handleNextStep}
          buyerValidation={buyerValidation}
          validateBuyer={validateBuyer}
          setBuyerValidation={setBuyerValidation}
          isValidatingBuyer={isValidatingBuyer}
        />
      )}

      {/* STEP 2: Agreement Manager */}
      {step === 2 && (
        <Step2Agreement
          formData={formData}
          updateFormData={updateFormData}
          setStep={handleNextStep}
          onSaveDraft={() => {}}
          isLoading={isSaving}
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
          isLoading={isSaving}
          setStep={setStep}
          title="Review & Edit"
          description="Verify details before updating the contract."
          buttonText="Edit Contract"
        />
      )}
    </div>
  );
}