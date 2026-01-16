"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Loader2,
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OrdersPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/contracts');
      setContracts(response.data.data.contracts);
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'FUNDED':
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-blue-600">Completed</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 animate-in fade-in w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage your escrow contracts.</p>
        </div>
        <Link href="/dashboard/orders/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Contract
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>All your buying and selling orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow
                    key={contract.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (contract.status === 'DRAFT') {
                        router.push(`/dashboard/orders/create?draftId=${contract.id}`);
                      } else {
                        router.push(`/dashboard/orders/${contract.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {contract.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* Identify role logic - simplification since we don't have user ID in state easily without context */}
                      <Badge variant="outline">Contract</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold">{parseFloat(contract.totalAmount).toFixed(2)} {contract.currency}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(contract.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(contract.createdAt), "PP")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mb-4 opacity-20" />
              <p className="mb-4">No contracts found.</p>
              <Link href="/dashboard/orders/create">
                <Button variant="outline" className="gap-2">
                  Create your first contract
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
