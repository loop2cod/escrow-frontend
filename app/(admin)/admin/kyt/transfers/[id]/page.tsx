"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, RefreshCw, Loader2, AlertCircle, Activity, User, Hash, Clock,
  DollarSign, Network, ArrowLeft, ExternalLink, FileText, CheckCircle2, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface KytCheck {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; userReferenceId: string | null; kycVerified: boolean; kycStatus: string } | null;
  wallet: { id: string; network: string; address: string; currency: string; status: string } | null;
  txHash: string;
  network: string;
  direction: string;
  tokenId: string;
  tokenSymbol: string | null;
  amount: number | null;
  fiatValue: number | null;
  fiatCurrency: string;
  riskLevel: string | null;
  riskScore: number | null;
  checkState: any;
  registeredAt: string;
  checkedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BitokExposure {
  checked_at: string | null;
  report_url: string | null;
  proximity: string | null;
  interaction: string | null;
  indirect_exposure: Array<{ entity_category: string; entity_category_color: string; share: string; risk_score: number }> | null;
}

interface BitokRisk {
  risk_level: string;
  occurred_at: string;
  detected_at: string;
  risk_type: string;
  entity_category: string;
  proximity: string;
  value_in_fiat: number;
  value_share: number;
  rule: {
    rule_type: string;
    rule_sub_type: string;
    entity_category: string;
    min_value_in_fiat: number;
    min_value_share: number;
  };
  fiat_currency: string;
}

interface BitokTransfer {
  id: string;
  risk_level: string;
  risk_score: number | null;
  amount: number | null;
  asset: string;
  network_code: string;
  exposure_status: string | null;
  exposure: BitokExposure | null;
  counterparty_status: string | null;
  report_url: string | null;
}

interface TransferDetails {
  kytCheck: KytCheck;
  bitokDetails: {
    transfer: BitokTransfer | null;
    exposure: any;
    counterparty: any;
    risks: BitokRisk[];
  } | null;
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      <Shield className="h-4 w-4" />
      <Link href="/admin/kyt" className="hover:text-foreground">KYT</Link>
      <span>/</span>
      <Link href="/admin/kyt/transfers" className="hover:text-foreground">Transfers</Link>
      <span>/</span>
      <span className="text-foreground font-medium">Details</span>
    </nav>
  );
}

function RiskBadge({ riskLevel }: { riskLevel: string | null }) {
  const getRiskColor = (risk: string | null) => {
    switch (risk) {
      case "none": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "low": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "severe": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };
  return (
    <Badge variant="outline" className={`${getRiskColor(riskLevel)} text-sm px-3 py-1`}>
      {riskLevel || "undefined"}
    </Badge>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </div>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

function RisksCard({ risks, loading }: { risks: BitokRisk[]; loading?: boolean }) {
  if (loading) {
    return (
      <Card className="p-4 border-0 shadow-lg">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />Risk Factors
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading risks...</span>
        </div>
      </Card>
    );
  }

  if (!risks || risks.length === 0) {
    return (
      <Card className="p-4 border-0 shadow-lg">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />Risk Factors
        </h3>
        <p className="text-sm text-muted-foreground">No risk factors identified</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-0 shadow-lg">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-primary" />Risk Factors
        <Badge variant="outline" className="ml-auto">{risks.length} {risks.length === 1 ? "risk" : "risks"}</Badge>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Category</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Interaction</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Risk Level</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Risky Value</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Share</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Alert Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {risks.map((risk, idx) => (
              <tr key={idx} className="hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{risk.entity_category}</td>
                <td className="px-3 py-2 text-muted-foreground">{risk.risk_type ? risk.risk_type.replace(/_/g, ' ') : 'N/A'}</td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="text-xs">{risk.proximity || 'N/A'}</Badge>
                </td>
                <td className="px-3 py-2">
                  <RiskBadge riskLevel={risk.risk_level} />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {risk.fiat_currency || 'USD'} {risk.value_in_fiat != null ? risk.value_in_fiat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                </td>
                <td className="px-3 py-2 text-right text-muted-foreground">
                  {risk.value_share != null ? (risk.value_share * 100).toFixed(2) : 'N/A'}%
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {risk.detected_at ? format(new Date(risk.detected_at), "MMM d, HH:mm") : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ExposureCard({ checkState }: { checkState: any }) {
  const exposure = checkState?.exposure;
  const indirectExposure = exposure?.indirect_exposure;
  
  if (!exposure || !indirectExposure || indirectExposure.length === 0) {
    return (
      <Card className="p-4 border-0 shadow-lg">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />Exposure Analysis
        </h3>
        <p className="text-sm text-muted-foreground">No exposure data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-0 shadow-lg">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />Exposure Analysis
      </h3>
      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Status:</span>
          <Badge variant="outline" className="ml-2">{checkState.exposure_status || "N/A"}</Badge>
        </div>
        <div>
          <span className="text-muted-foreground">Proximity:</span>
          <Badge variant="outline" className="ml-2">{exposure.proximity || "N/A"}</Badge>
        </div>
        <div>
          <span className="text-muted-foreground">Interaction:</span>
          <Badge variant="outline" className="ml-2">{exposure.interaction || "N/A"}</Badge>
        </div>
        <div>
          <span className="text-muted-foreground">Checked:</span>
          <span className="ml-2">{exposure.checked_at ? format(new Date(exposure.checked_at), "MMM d, yyyy HH:mm") : "N/A"}</span>
        </div>
      </div>
      {exposure.report_url && (
        <div className="mb-4">
          <a href={exposure.report_url} target="_blank" rel="noopener noreferrer" 
            className="text-primary hover:underline text-sm flex items-center gap-1">
            <FileText className="h-4 w-4" />View Full Report
          </a>
        </div>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium pb-2 border-b">
          <span>Entity Category</span>
          <div className="flex items-center gap-4">
            <span>Share</span>
            <span>Risk Score</span>
          </div>
        </div>
        {indirectExposure.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.entity_category_color }} />
              <span className="text-sm">{item.entity_category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16 text-right">{(parseFloat(item.share) * 100).toFixed(2)}%</span>
              <Badge variant="outline" className="text-xs w-20 justify-center">{(item.risk_score * 100).toFixed(1)}%</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function TransferDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<TransferDetails | null>(null);
  const [risks, setRisks] = useState<BitokRisk[]>([]);
  const [risksLoading, setRisksLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/kyt/admin/transfers/${id}`);
      if (response.data.status && response.data.data) {
        setData(response.data.data);
      } else {
        setError(response.data.message || "Invalid response from server");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load transfer details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRisks = async () => {
    setRisksLoading(true);
    try {
      const response = await apiClient.get(`/kyt/admin/transfers/${id}/risks`);
      if (response.data.status && response.data.data) {
        setRisks(response.data.data.risks || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch risks:", err);
    } finally {
      setRisksLoading(false);
    }
  };

  useEffect(() => { 
    fetchDetails();
    fetchRisks();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading transfer details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error || "Transfer not found"}</p>
        <div className="flex gap-2">
          <Button onClick={fetchDetails}>Retry</Button>
          <Button variant="outline" asChild><Link href="/admin/kyt/transfers">Back to Transfers</Link></Button>
        </div>
      </div>
    );
  }

  const { kytCheck, bitokDetails } = data;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Breadcrumb />
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={fetchDetails} className="gap-2">
            <RefreshCw className="h-4 w-4" />Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/kyt/transfers"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Transfer Details</h1>
          <p className="text-muted-foreground mt-1 text-sm">Detailed view of transfer and risk assessment</p>
        </div>
        <RiskBadge riskLevel={kytCheck.riskLevel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 border-0 shadow-lg">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />Transfer Information
          </h3>
          <div className="space-y-1">
            <InfoRow label="Transfer ID" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded">{kytCheck.id}</code>} />
            <InfoRow label="TX Hash" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded break-all">{kytCheck.txHash}</code>} icon={Hash} />
            <InfoRow label="Network" value={<Badge variant="outline">{kytCheck.network}</Badge>} icon={Network} />
            <InfoRow label="Direction" value={<Badge variant="outline">{kytCheck.direction}</Badge>} />
            <InfoRow label="Token" value={kytCheck.tokenSymbol || kytCheck.tokenId} />
            <InfoRow label="Amount" value={kytCheck.amount !== null ? `${kytCheck.amount.toLocaleString()} ${kytCheck.tokenSymbol || ""}` : "N/A"} icon={DollarSign} />
            <InfoRow label="Fiat Value" value={kytCheck.fiatValue !== null ? `${kytCheck.fiatCurrency} ${kytCheck.fiatValue.toLocaleString()}` : "N/A"} />
            <InfoRow label="Risk Score" value={kytCheck.riskScore !== null ? `${(kytCheck.riskScore * 100).toFixed(1)}%` : "N/A"} />
            <InfoRow label="Registered" value={format(new Date(kytCheck.registeredAt), "PPpp")} icon={Clock} />
            <InfoRow label="Checked" value={kytCheck.checkedAt ? format(new Date(kytCheck.checkedAt), "PPpp") : "Not checked"} />
          </div>
        </Card>

        <Card className="p-4 border-0 shadow-lg">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />User Information
          </h3>
          {kytCheck.user ? (
            <div className="space-y-1">
              <InfoRow label="Name" value={kytCheck.user.name} />
              <InfoRow label="Email" value={kytCheck.user.email} />
              <InfoRow label="User ID" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded">{kytCheck.user.id}</code>} />
              <InfoRow label="Reference ID" value={kytCheck.user.userReferenceId || "N/A"} />
              <InfoRow label="KYC Status" value={<Badge variant="outline">{kytCheck.user.kycStatus}</Badge>} />
              <InfoRow label="KYC Verified" value={kytCheck.user.kycVerified ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : "No"} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">User information not available</p>
          )}
        </Card>

        <Card className="p-4 border-0 shadow-lg">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />Wallet Information
          </h3>
          {kytCheck.wallet ? (
            <div className="space-y-1">
              <InfoRow label="Wallet ID" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded">{kytCheck.wallet.id}</code>} />
              <InfoRow label="Network" value={<Badge variant="outline">{kytCheck.wallet.network}</Badge>} />
              <InfoRow label="Address" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded break-all">{kytCheck.wallet.address || "N/A"}</code>} />
              <InfoRow label="Currency" value={kytCheck.wallet.currency} />
              <InfoRow label="Status" value={<Badge variant="outline">{kytCheck.wallet.status}</Badge>} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Wallet information not available</p>
          )}
        </Card>

        {bitokDetails?.transfer && (
          <Card className="p-4 border-0 shadow-lg">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />Bitok Assessment
            </h3>
            <div className="space-y-1">
              <InfoRow label="Bitok ID" value={<code className="text-xs bg-muted px-1.5 py-0.5 rounded">{bitokDetails.transfer.id}</code>} />
              <InfoRow label="Risk Level" value={<RiskBadge riskLevel={bitokDetails.transfer.risk_level} />} />
              <InfoRow label="Risk Score" value={bitokDetails.transfer.risk_score !== null ? `${(bitokDetails.transfer.risk_score * 100).toFixed(1)}%` : "N/A"} />
              <InfoRow label="Exposure Status" value={<Badge variant="outline">{bitokDetails.transfer.exposure_status || "N/A"}</Badge>} />
              <InfoRow label="Counterparty Status" value={<Badge variant="outline">{bitokDetails.transfer.counterparty_status || "N/A"}</Badge>} />
              {bitokDetails.transfer.report_url && (
                <InfoRow label="Report" value={<a href={bitokDetails.transfer.report_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">View Report <ExternalLink className="h-3 w-3" /></a>} />
              )}
            </div>
          </Card>
        )}
      </div>

      {(risks.length > 0 || risksLoading) && (
        <RisksCard risks={risks} loading={risksLoading} />
      )}
      
      {kytCheck.checkState && (
        <ExposureCard checkState={kytCheck.checkState} />
      )}
    </div>
  );
}