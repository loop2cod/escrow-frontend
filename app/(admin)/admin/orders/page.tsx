"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Order {
    id: string;
    title: string;
    totalAmount: string;
    currency: string;
    status: string;
    seller: { name: string; email: string };
    buyer: { name: string; email: string };
    createdAt: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await apiClient.get("/contracts"); // Admin usage of this endpoint
            setOrders(res.data.data.contracts);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING_REVIEW":
            case "DELIVERY_REVIEWED":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "PENDING_ACCEPTANCE":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "AGREED":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "PAYMENT_SUBMITTED":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "IN_PROGRESS":
                return "bg-indigo-100 text-indigo-800 border-indigo-200";
            case "DELIVERED":
                return "bg-cyan-100 text-cyan-800 border-cyan-200";
            case "COMPLETED":
                return "bg-green-100 text-green-800 border-green-200";
            case "CANCELLED":
            case "REJECTED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.seller?.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === "ALL") return matchesSearch;
        return matchesSearch && order.status === statusFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
                <Button onClick={fetchOrders} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">All Orders</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search orders..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {/* Simple Filter Dropdown mockup */}
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="PENDING_REVIEW">Pending Review</option>
                                <option value="PENDING_ACCEPTANCE">Pending Acceptance</option>
                                <option value="AGREED">Agreed</option>
                                <option value="PAYMENT_SUBMITTED">Payment Submitted</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="DELIVERY_REVIEWED">Delivery Reviewed</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Seller</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            Loading orders...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {order.id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell className="font-medium">{order.title}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{order.seller?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">{order.seller?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {parseFloat(order.totalAmount).toLocaleString()} {order.currency}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${getStatusColor(order.status)} border-0`}>
                                                    {order.status.replace(/_/g, " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(new Date(order.createdAt), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4 mr-1" /> View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
