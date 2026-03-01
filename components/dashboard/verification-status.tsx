"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  User,
  Users,
} from "lucide-react";
import { createVerification, getVerificationStatus, type VerificationData } from "@/lib/api/verification";
import { toast } from "sonner";

interface VerificationStatusProps {
  onVerificationApproved?: () => void;
  onVerificationStatusChange?: (isVerified: boolean) => void;
}

export function VerificationStatus({ onVerificationApproved, onVerificationStatusChange }: VerificationStatusProps) {
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<'kyc' | 'kyb'>('kyc');

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await getVerificationStatus();
      setVerification(response.data);

      // Notify parent about verification status
      if (onVerificationStatusChange) {
        onVerificationStatusChange(response.data?.status === 'approved');
      }
    } catch (error: any) {
      console.error("Failed to fetch verification status:", error);
      if (onVerificationStatusChange) {
        onVerificationStatusChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const handleCreateVerification = async () => {
    try {
      setCreating(true);
      const response = await createVerification(selectedType);
      setVerification(response.data);
      toast.success("Verification link created successfully!");
    } catch (error: any) {
      console.error("Failed to create verification:", error);
      toast.error(error.response?.data?.message || "Failed to create verification");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenVerification = () => {
    if (verification?.verificationUrl) {
      window.open(verification.verificationUrl, "_blank");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-green-600 bg-green-50 dark:bg-green-950/20";
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20";
      case "rejected":
      case "expired":
        return "text-red-600 bg-red-50 dark:bg-red-950/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "expired":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  // No verification exists - show call to action with type selection
  if (!verification) {
    return (
      <Card className="p-6 border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/10">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <ShieldCheck className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Verification Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To access your wallet and start using the platform, you need to complete verification.
              Please select your account type below.
            </p>

            {/* Account Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setSelectedType('kyc')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedType === 'kyc'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${selectedType === 'kyc' ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Individual (KYC)</p>
                    <p className="text-xs text-muted-foreground">
                      For personal accounts
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('kyb')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedType === 'kyb'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${selectedType === 'kyb' ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Corporate (KYB)</p>
                    <p className="text-xs text-muted-foreground">
                      For business accounts
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <Button
              onClick={handleCreateVerification}
              disabled={creating}
              className="gap-2 w-full sm:w-auto"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Verification...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Start {selectedType === 'kyc' ? 'KYC' : 'KYB'} Verification
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Verification exists - show status
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            {getStatusIcon(verification.status)}
          </div>
          <div>
            <h3 className="text-lg font-semibold">KYC Verification Status</h3>
            <p className="text-sm text-muted-foreground">
              Reference: {verification.id.substring(0, 8)}...
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(verification.status)}>
          {verification.status.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-3">
        {verification.status.toLowerCase() === "pending" && (
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  Verification In Progress
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Please complete your verification by clicking the button below. The verification process is handled securely by our partner NFI Clear.
                </p>
                <Button
                  size="sm"
                  onClick={handleOpenVerification}
                  variant="outline"
                  className="gap-2 border-yellow-300 dark:border-yellow-800"
                >
                  Open Verification Link
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {verification.status.toLowerCase() === "approved" && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                  Verification Approved
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your account is verified and you have full access to the platform.
                  {verification.resolvedAt && (
                    <> Approved on {new Date(verification.resolvedAt).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {verification.status.toLowerCase() === "rejected" && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                  Verification Rejected
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  Your verification was rejected. Please contact support or try again with different documents.
                </p>
                <Button
                  size="sm"
                  onClick={handleCreateVerification}
                  disabled={creating}
                  variant="outline"
                  className="gap-2 border-red-300 dark:border-red-800"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Try Again
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {verification.status.toLowerCase() === "expired" && (
          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Verification Expired
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                  Your verification link has expired. Please create a new verification request.
                </p>
                <Button
                  size="sm"
                  onClick={handleCreateVerification}
                  disabled={creating}
                  variant="outline"
                  className="gap-2 border-orange-300 dark:border-orange-800"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create New Verification
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 text-xs text-muted-foreground">
          <p>Requested on: {new Date(verification.requestedAt).toLocaleString()}</p>
          {verification.resolvedAt && (
            <p>Resolved on: {new Date(verification.resolvedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
