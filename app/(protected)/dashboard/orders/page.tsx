"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="grid md:flex gap-2 items-center justify-between">
        <div>
          <h1 className="text-base font-bold tracking-tight">Orders</h1>
          <p className="test-xs text-muted-foreground">
            Manage your escrow agreements and orders
          </p>
        </div>
        <Button className="items-center w-fit" asChild>
          <Link href="/dashboard/orders/create">
            <Plus className="" />
            Create Order
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">No orders yet</p>
        <p className="text-xs text-muted-foreground mt-2">
          Create your first escrow agreement to get started
        </p>
      </div>
    </div>
  );
}
