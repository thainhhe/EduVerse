import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { paymentService } from "@/services/paymentService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Loader2, CreditCard, CheckCircle, XCircle, Search, AlertCircle } from "lucide-react";
import Pagination from "@/helper/Pagination";

const PaymentHistory = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const userId = user?._id || user?.id;
                if (!userId) return;

                const response = await paymentService.getAllPaymentUser(userId);
                // Ensure we have an array and sort by date descending (newest first)
                const data = Array.isArray(response.data) ? response.data : [];
                const sortedData = data.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
                setPayments(sortedData);
            } catch (err) {
                console.error("Failed to fetch payment history:", err);
                setError("Failed to load payment history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [user]);

    // Filter payments based on search term
    const filteredPayments = payments.filter((payment) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            payment.courseId?.title?.toLowerCase().includes(searchLower) ||
            payment.orderCode?.toString().toLowerCase().includes(searchLower) ||
            payment.orderId?.toLowerCase().includes(searchLower)
        );
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "paid":
                return (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 border-0">
                        <CheckCircle className="w-3 h-3 mr-1" /> Paid
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                        <XCircle className="w-3 h-3 mr-1" /> Cancelled
                    </Badge>
                );
            case "failed":
                return (
                    <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                        <AlertCircle className="w-3 h-3 mr-1" /> Failed
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-red-500 gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payment History</h1>
                <p className="text-gray-500">View and manage your transaction history</p>
            </div>

            <Card className="shadow-xl border-0 bg-white overflow-hidden ring-1 ring-gray-100">
                <CardHeader className="border-b bg-gray-50/40 px-6 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-indigo-600" />
                                Transactions
                            </CardTitle>
                            <CardDescription>You have {payments.length} total transactions</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by course or order code..."
                                className="pl-9 bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to first page on search
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredPayments.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                                We couldn't find any transactions matching your search criteria.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                            <TableHead className="w-[180px] font-semibold text-gray-600">
                                                Order Code
                                            </TableHead>
                                            <TableHead className="w-[200px] font-semibold text-gray-600">
                                                Date
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-600">
                                                Course
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-600">
                                                Method
                                            </TableHead>
                                            <TableHead className="text-right font-semibold text-gray-600">
                                                Amount
                                            </TableHead>
                                            <TableHead className="text-center font-semibold text-gray-600">
                                                Status
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentPayments.map((payment) => (
                                            <TableRow
                                                key={payment._id}
                                                className="hover:bg-indigo-50/30 transition-colors group"
                                            >
                                                <TableCell className="font-medium text-gray-700">
                                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        {payment.orderCode ||
                                                            payment.orderId?.slice(-8).toUpperCase()}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {payment.paymentDate
                                                        ? format(
                                                              new Date(payment.paymentDate),
                                                              "MMM dd, yyyy • HH:mm"
                                                          )
                                                        : "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className="font-medium text-gray-900 block truncate max-w-[250px]"
                                                        title={payment.courseId?.title}
                                                    >
                                                        {payment.courseId?.title || "Unknown Course"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="capitalize text-gray-600">
                                                    {payment.paymentMethod?.replace(/_/g, " ").toLowerCase()}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-indigo-600">
                                                    {formatCurrency(payment.amount)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(payment.status)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <div className="py-4 border-t border-gray-100 bg-gray-50/30">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentHistory;
