"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Plus, Trash2 } from "lucide-react";

interface Step3Props {
    formData: any;
    updateMilestone: (index: number, field: string, value: string) => void;
    addMilestone: () => void;
    removeMilestone: (index: number) => void;
    totalAmount: number;
    setStep: (step: number) => void;
}

export default function Step3Milestones({
    formData,
    updateMilestone,
    addMilestone,
    removeMilestone,
    totalAmount,
    setStep
}: Step3Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>Break down the project into fundable deliverables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {formData.milestones.map((milestone: any, index: number) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 rounded-lg border bg-muted/20 relative group">
                        <div className="col-span-12 md:col-span-7 space-y-2">
                            <Label>Milestone {index + 1}</Label>
                            <Input
                                placeholder="e.g. Initial Design Mockups"
                                value={milestone.title}
                                onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                            />
                            <Input
                                placeholder="Description (optional)"
                                className="text-xs h-8"
                                value={milestone.description}
                                onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                            />
                        </div>
                        <div className="col-span-10 md:col-span-4 space-y-2">
                            <Label>Amount (USDT)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={milestone.amount}
                                onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1 pt-8 flex justify-end">
                            {formData.milestones.length > 1 && (
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeMilestone(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                <Button variant="outline" className="w-full border-dashed" onClick={addMilestone}>
                    <Plus className="mr-2 h-4 w-4" /> Add Milestone
                </Button>

                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm font-medium">Total Value:</div>
                    <div className="text-xl font-bold">{totalAmount.toFixed(2)} USDT</div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={() => setStep(4)}>Next: Review <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </CardFooter>
        </Card>
    );
}
