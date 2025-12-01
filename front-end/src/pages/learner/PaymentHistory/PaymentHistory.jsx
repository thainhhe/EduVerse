import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { paymentService } from "@/services/paymentService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, CreditCard, Calendar, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";

const PaymentHistory = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const userId = user?._id || user?.id;
                if (!userId) return;

                const response = await paymentService.getAllPaymentUser(userId);
                // Assuming response.data contains the array of payments
                // Adjust based on actual API response structure
                setPayments(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Failed to fetch payment history:", err);
                setError("Failed to load payment history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [user]);

    const getStatusBadge = (status) => {
        switch (status) {
            case "paid":
                return (
                    <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" /> Paid
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        <XCircle className="w-3 h-3 mr-1" /> Cancelled
                    </Badge>
                );
            case "failed":
                return (
                    <Badge className="bg-red-500 hover:bg-red-600">
                        <XCircle className="w-3 h-3 mr-1" /> Failed
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
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-[60vh] text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-indigo-600" />
                        Payment History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {payments.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No payment history found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                                        <TableHead className="w-[200px] font-semibold">Order ID</TableHead>
                                        <TableHead className="w-[200px] font-semibold">Order Code</TableHead>
                                        <TableHead className="w-[200px] font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold">Course</TableHead>
                                        <TableHead className="font-semibold">Method</TableHead>
                                        <TableHead className="text-right font-semibold">Amount</TableHead>
                                        <TableHead className="text-center font-semibold">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow
                                            key={payment._id}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <TableCell className="font-medium text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    {payment.orderId}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    {payment.orderCode}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    {payment.paymentDate
                                                        ? format(
                                                              new Date(payment.paymentDate),
                                                              "dd/MM/yyyy HH:mm"
                                                          )
                                                        : "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-gray-800">
                                                    {payment.courseId?.title || "Unknown Course"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="capitalize text-gray-600">
                                                {payment.paymentMethod?.replace("_", " ")}
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentHistory;
