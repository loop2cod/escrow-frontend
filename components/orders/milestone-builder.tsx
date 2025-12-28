"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  percentage: number;
  releaseCondition: string;
}

interface MilestoneBuilderProps {
  milestones: Milestone[];
  onChange: (milestones: Milestone[]) => void;
}

export function MilestoneBuilder({ milestones, onChange }: MilestoneBuilderProps) {
  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      title: "",
      description: "",
      percentage: 0,
      releaseCondition: "",
    };
    onChange([...milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    onChange(milestones.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string | number) => {
    onChange(
      milestones.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const totalPercentage = milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);
  const isValidPercentage = totalPercentage === 100;

  return (
    <div className="space-y-4">
      <div className="grid md:flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Milestones & Payment Schedule</h3>
          <p className="text-xs text-muted-foreground">
            Define milestones and their payment percentages (must total 100%)
          </p>
        </div>
        <div className="text-sm">
          <span className={cn(
            "font-semibold",
            isValidPercentage ? "text-green-600" : "text-destructive"
          )}>
            Total: {totalPercentage}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <Card key={milestone.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="size-5 text-muted-foreground cursor-move" />
                <CardTitle className="text-base">
                  Milestone {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeMilestone(milestone.id)}
                  className="ml-auto"
                  disabled={milestones.length === 1}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`title-${milestone.id}`}>Title</Label>
                  <Input
                    id={`title-${milestone.id}`}
                    placeholder="e.g., Design Phase"
                    value={milestone.title}
                    onChange={(e) =>
                      updateMilestone(milestone.id, "title", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`percentage-${milestone.id}`}>
                    Payment Percentage (%)
                  </Label>
                  <Input
                    id={`percentage-${milestone.id}`}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={milestone.percentage || ""}
                    onChange={(e) =>
                      updateMilestone(
                        milestone.id,
                        "percentage",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${milestone.id}`}>Description</Label>
                <Textarea
                  id={`description-${milestone.id}`}
                  placeholder="Describe what needs to be delivered in this milestone"
                  value={milestone.description}
                  onChange={(e) =>
                    updateMilestone(milestone.id, "description", e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`condition-${milestone.id}`}>
                  Release Condition
                </Label>
                <Input
                  id={`condition-${milestone.id}`}
                  placeholder="e.g., Buyer approval required"
                  value={milestone.releaseCondition}
                  onChange={(e) =>
                    updateMilestone(
                      milestone.id,
                      "releaseCondition",
                      e.target.value
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addMilestone}
        className="w-full"
        type="button"
      >
        <Plus className="mr-2 size-4" />
        Add Milestone
      </Button>

      {!isValidPercentage && milestones.length > 0 && (
        <p className="text-sm text-destructive">
          Payment percentages must total exactly 100%
        </p>
      )}
    </div>
  );
}
