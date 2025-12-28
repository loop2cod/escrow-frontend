"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MilestoneBuilder, Milestone } from "@/components/orders/milestone-builder";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateOrderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    totalAmount: "",
    buyerEmail: "",
    currency: "USD",
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: `milestone-${Date.now()}`,
      title: "",
      description: "",
      percentage: 100,
      releaseCondition: "",
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalPercentage = milestones.reduce(
      (sum, m) => sum + (Number(m.percentage) || 0),
      0
    );

    if (totalPercentage !== 100) {
      alert("Payment percentages must total exactly 100%");
      return;
    }

    // Validate all fields
    if (!formData.title || !formData.description || !formData.totalAmount || !formData.buyerEmail) {
      alert("Please fill in all required fields");
      return;
    }

    const escrowAgreement = {
      ...formData,
      totalAmount: Number(formData.totalAmount),
      milestones: milestones.map((m, index) => ({
        order: index + 1,
        title: m.title,
        description: m.description,
        paymentPercentage: m.percentage,
        releaseCondition: m.releaseCondition,
      })),
    };

    console.log("Escrow Agreement:", escrowAgreement);

    // TODO: Submit to API
    // For now, just redirect back
    router.push("/dashboard/orders");
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-base font-bold tracking-tight">Create Escrow Agreement</h1>
          <p className="text-xs text-muted-foreground">
            Define the terms and conditions for your escrow order
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the essential details about this escrow agreement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Agreement Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Website Development Project"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the work or product being exchanged"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, totalAmount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerEmail">Buyer Email *</Label>
              <Input
                id="buyerEmail"
                type="email"
                placeholder="buyer@example.com"
                value={formData.buyerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, buyerEmail: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                The buyer will receive an invitation to participate in this escrow
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Milestones */}
        <Card>
          <CardContent>
            <MilestoneBuilder
              milestones={milestones}
              onChange={setMilestones}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/dashboard/orders">Cancel</Link>
          </Button>
          <Button type="submit">
            <Save className="mr-2 size-4" />
            Create Agreement
          </Button>
        </div>
      </form>
    </div>
  );
}
