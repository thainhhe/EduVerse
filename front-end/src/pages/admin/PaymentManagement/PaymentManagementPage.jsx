import React, { useEffect, useState } from "react";
import { paymentService } from "@/services/paymentService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter } from "lucide-react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PaymentManagementPage = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedPayments, setSelectedPayments] = useState([]);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await paymentService.getAllPaymentAdmin();
            console.log("data:", response?.data);
            if (response?.success) {
                const data = response?.data || [];
                setPayments(data);
            }
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(
        (payment) =>
            payment._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.courseId?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.orderCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const toggleSelectAll = () => {
        const currentIds = currentPayments.map((p) => p._id || p.id);
        if (isAllSelected) {
            setSelectedPayments(selectedPayments.filter((id) => !currentIds.includes(id)));
        } else {
            setSelectedPayments([...new Set([...selectedPayments, ...currentIds])]);
        }
    };

    const toggleSelectPayment = (id) => {
        if (selectedPayments.includes(id)) {
            setSelectedPayments(selectedPayments.filter((pId) => pId !== id));
        } else {
            setSelectedPayments([...selectedPayments, id]);
        }
    };

    const isAllSelected =
        currentPayments.length > 0 && currentPayments.every((p) => selectedPayments.includes(p._id || p.id));

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "paid":
                return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
            case "cancelled":
                return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";
            case "failed":
                return "bg-red-100 text-red-800 hover:bg-red-200 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";
        }
    };

    const totalRevenue = payments
        .filter((p) => p.status === "paid")
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return (
        <div className="max-w-full mx-auto space-y-4 bg-slate-50/50 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="bg-white shadow-sm hover:shadow-md transition-shadow p-8 rounded-lg border border-slate-200">
                    <div className="flex flex-row items-center justify-between space-y-0">
                        <h2 className="text-sm font-medium text-slate-600">Total Revenue</h2>
                        <span className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                totalRevenue
                            )}
                        </span>
                    </div>
                </div>
                <div className="bg-white shadow-sm hover:shadow-md transition-shadow p-8 rounded-lg border border-slate-200">
                    <div className="flex flex-row items-center justify-between space-y-0">
                        <h2 className="text-sm font-medium text-slate-600">Total Transactions</h2>
                        <span className="text-2xl font-bold text-blue-600">{payments.length}</span>
                    </div>
                </div>
                <div className="bg-white shadow-sm hover:shadow-md transition-shadow p-8 rounded-lg border border-slate-200">
                    <div className="flex flex-row items-center justify-between space-y-0">
                        <h2 className="text-sm font-medium text-slate-600">Cancelled</h2>
                        <span className="text-2xl font-bold text-yellow-600">
                            {payments.filter((p) => p.status === "cancelled").length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="max-w-full mx-auto shadow-sm border-none">
                <div className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 bg-gray-500 text-black">
                        <div className="flex flex-col items-center sm:flex-row gap-2">
                            <Button variant="outline" className="bg-white text-black hover:bg-gray-100">
                                <Download className="mr-2 h-4 w-4" /> Export
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search payments..."
                                className="pl-8 w-full sm:w-[250px] bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white">
                    <div className="overflow-y-auto">
                        <Table>
                            <TableHeader className="bg-gray-300">
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={isAllSelected}
                                            onCheckedChange={toggleSelectAll}
                                            aria-label="Select all"
                                            className="!rounded"
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold">Transaction ID</TableHead>
                                    <TableHead className="font-semibold">Order ID</TableHead>
                                    <TableHead className="font-semibold">Code</TableHead>
                                    <TableHead className="font-semibold">User</TableHead>
                                    <TableHead className="font-semibold">Course</TableHead>
                                    <TableHead className="font-semibold">Amount</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Date</TableHead>
                                    {selectedPayments.length > 0 && (
                                        <TableHead className="text-right font-semibold">Actions</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={selectedPayments.length > 0 ? 10 : 9}
                                            className="text-center py-10"
                                        >
                                            <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                                                Loading payments...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={selectedPayments.length > 0 ? 10 : 9}
                                            className="text-center py-10 text-muted-foreground"
                                        >
                                            No payments found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentPayments.map((payment) => (
                                        <TableRow
                                            key={payment._id || payment.id}
                                            className={`hover:bg-gray-200 transition-colors cursor-pointer ${
                                                selectedPayments.includes(payment._id || payment.id)
                                                    ? "bg-gray-200"
                                                    : ""
                                            }`}
                                            onClick={() => toggleSelectPayment(payment._id || payment.id)}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedPayments.includes(
                                                        payment._id || payment.id
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSelectPayment(payment._id || payment.id)
                                                    }
                                                    aria-label="Select row"
                                                    className="!rounded data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium font-mono text-xs text-slate-600 max-w-[150px] overflow-hidden text-ellipsis">
                                                {payment.transactionId || payment._id}
                                            </TableCell>
                                            <TableCell className="font-medium font-mono text-xs text-slate-600 max-w-[150px] overflow-hidden text-ellipsis">
                                                {payment.orderId}
                                            </TableCell>
                                            <TableCell className="font-medium font-mono text-xs text-slate-600 max-w-[150px] overflow-hidden text-ellipsis">
                                                {payment.orderCode}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={payment.userId?.avatar || "/avatar.png"}
                                                        />
                                                        <AvatarFallback>UN</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm text-slate-900">
                                                            {payment.userId?.username || "Unknown User"}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {payment.userId?.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={payment.courseId?.thumbnail || "/avatar.png"}
                                                        />
                                                        <AvatarFallback>UN</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm text-slate-900">
                                                            {payment.courseId?.title || "Unknown Course"}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Intl.NumberFormat("vi-VN", {
                                                                style: "currency",
                                                                currency: "VND",
                                                            }).format(payment.courseId?.price || 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(payment.amount || 0)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${getStatusColor(
                                                        payment.status
                                                    )} shadow-none`}
                                                    variant="outline"
                                                >
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {payment.createdAt
                                                    ? format(new Date(payment.createdAt), "PPP")
                                                    : "N/A"}
                                            </TableCell>
                                            {selectedPayments.length > 0 && (
                                                <TableCell
                                                    className="text-right"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {selectedPayments.includes(payment._id || payment.id) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(
                                                                    `/admin/payment/${
                                                                        payment._id || payment.id
                                                                    }`
                                                                );
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Rows per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-[70px] border-none text-sm"
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="text-sm flex items-center gap-2"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="text-sm flex items-center gap-2"
                            >
                                Next <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentManagementPage;
