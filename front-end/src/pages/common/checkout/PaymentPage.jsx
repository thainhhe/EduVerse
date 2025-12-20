import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Lock, CheckCircle2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ToastHelper } from "@/helper/ToastHelper";
import { paymentService } from "@/services/paymentService";

const PaymentPage = () => {
    const location = useLocation();
    const { user } = useAuth();

    // 🔹 Lấy dữ liệu khóa học từ state
    const { courseId, courseTitle, coursePrice } = location.state || {};
    const onSubmit = async () => {
        try {
            if (!user?._id) {
                ToastHelper.error("Vui lòng đăng nhập trước khi thanh toán.");
                return;
            }

            const data_payment = {
                userId: user._id,
                courseId,
                total_amount: coursePrice,
                description: `${
                    courseTitle.length > 24 ? courseTitle.substring(0, 21) + "..." : courseTitle
                }`,
            };

            // console.log("✅ Payment data:", data_payment);
            const res = await paymentService.createPayment(data_payment);
            console.log("res:", res);
            const paymentLinkIntent = res.data?.checkoutUrl;
            console.log("paymentLinkIntent", paymentLinkIntent);
            if (paymentLinkIntent) {
                localStorage.setItem(
                    "payment_course_info",
                    JSON.stringify({
                        courseId,
                        courseTitle,
                        coursePrice,
                    })
                );
                window.open(paymentLinkIntent, "_blank");
            } else {
                ToastHelper.error("Không tìm thấy link thanh toán.");
            }
        } catch (err) {
            console.error("❌ Lỗi khi thanh toán:", err);
            ToastHelper.error("Thanh toán thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-slate-900" />
                        <h1 className="text-xl font-semibold text-slate-900">Secure Payment</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Section - Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-8 bg-white border-slate-200">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {courseTitle}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Full access to course materials
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Subtotal</span>
                                        <span className="text-slate-900 font-medium">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(coursePrice || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Tax</span>
                                        <span className="text-slate-900 font-medium">0 ₫</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-200 flex justify-between">
                                        <span className="font-semibold text-slate-900">Total</span>
                                        <span className="text-lg font-bold text-slate-900">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(coursePrice || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Section - Form */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white border-slate-200">
                            <div className="p-8">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900 mb-4">
                                            Personal Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label
                                                    htmlFor="fullName"
                                                    className="text-sm font-medium text-slate-700"
                                                >
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="fullName"
                                                    className="mt-2 border-slate-300 focus:border-slate-900"
                                                    value={user?.username || ""}
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <Label
                                                    htmlFor="email"
                                                    className="text-sm font-medium text-slate-700"
                                                >
                                                    Email Address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    className="mt-2 border-slate-300 focus:border-slate-900"
                                                    value={user?.email || ""}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Course Selection */}
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900 mb-4">
                                            Course Details
                                        </h3>
                                        <div className="mt-2 flex h-10 w-full items-center rounded-md border border-slate-300 bg-gray-50 px-3 text-sm text-slate-900">
                                            {courseTitle}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full px-6 text-center">
                                        <p className="text-xs text-slate-500 break-all">
                                            Note: If you encounter any problems during the checkout process,
                                            please take a screenshot as proof and contact us via email at
                                            admin@eduverse.com for prompt assistance.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={onSubmit}
                                        size="lg"
                                        className="w-full bg-indigo-600 hover:bg-indigo-800 text-white font-medium h-11"
                                    >
                                        Pay Now
                                    </Button>

                                    <p className="text-xs text-slate-500 text-center">
                                        Your payment information is secure and encrypted
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
