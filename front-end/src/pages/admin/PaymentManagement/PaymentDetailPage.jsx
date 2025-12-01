import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { paymentService } from "@/services/paymentService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, CreditCard, User, BookOpen, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

const PaymentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                setLoading(true);
                const response = await paymentService.getPaymentById(id);
                if (response?.success) {
                    setPayment(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch payment details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPayment();
        }
    }, [id]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "success":
            case "completed":
            case "paid":
                return "bg-green-100 text-green-800 border-green-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "failed":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "paid":
                return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case "cancelled":
                return <XCircle className="w-5 h-5 text-yellow-600" />;
            case "failed":
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <CreditCard className="w-5 h-5 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Payment Not Found</h2>
                <Button onClick={() => navigate("/admin/payment")}>Back to Payments</Button>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto space-y-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 border"
                    onClick={() => navigate("/admin/payment")}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transaction Details</h1>
                    <p className="text-slate-500">
                        View complete information for transaction{" "}
                        <span className="font-mono font-medium text-slate-700">
                            #{payment.transactionId || payment._id}
                        </span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-indigo-600" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Amount</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(payment.amount || 0)}
                                    </p>
                                </div>
                                <Badge
                                    className={`${getStatusColor(
                                        payment.status
                                    )} px-3 py-1 text-sm flex items-center gap-2`}
                                    variant="outline"
                                >
                                    {getStatusIcon(payment.status)}
                                    {payment.status?.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Transaction ID</p>
                                    <p className="font-mono text-sm bg-slate-100 p-2 rounded border">
                                        {payment.transactionId || payment._id}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Order ID</p>
                                    <p className="font-mono text-sm bg-slate-100 p-2 rounded border">
                                        {payment.orderId}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Order Code</p>
                                    <p className="font-mono text-sm bg-slate-100 p-2 rounded border">
                                        {payment.orderCode}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Payment Date</p>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>
                                            {payment.createdAt
                                                ? format(new Date(payment.createdAt), "PPP pp")
                                                : "N/A"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Payment Method</p>
                                    <p className="font-mono text-sm bg-slate-100 p-2 rounded border text-slate-700 capitalize">
                                        {payment.paymentMethod || "Online Payment"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                Course Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden border bg-slate-100 shrink-0">
                                    <img
                                        src={payment.courseId?.thumbnail || "/placeholder.png"}
                                        alt={payment.courseId?.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h3 className="text-xl font-semibold text-slate-900">
                                        {payment.courseId?.title || "Unknown Course"}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-2">
                                        {payment.courseId?.description}
                                    </p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <Badge variant="secondary">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(payment.courseId?.price || 0)}
                                        </Badge>
                                        <span className="text-xs text-slate-400">
                                            ID: {payment.courseId?._id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" />
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center text-center p-4">
                                <Avatar className="w-20 h-20 mb-4 border-4 border-white shadow-lg">
                                    <AvatarImage src={payment.userId?.avatar || "/avatar.png"} />
                                    <AvatarFallback className="text-lg">
                                        {payment.userId?.username?.substring(0, 2).toUpperCase() || "UN"}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {payment.userId?.username || "Unknown User"}
                                </h3>
                                <p className="text-slate-500 text-sm mb-4">{payment.userId?.email}</p>
                                <div className="w-full space-y-3 text-left">
                                    <Separator />
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            User ID
                                        </p>
                                        <p
                                            className="text-xs font-mono text-slate-700 truncate"
                                            title={payment.userId?._id}
                                        >
                                            {payment.userId?._id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Role
                                        </p>
                                        <Badge variant="outline" className="capitalize mt-1">
                                            {payment.userId?.role || "Learner"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailPage;
