import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useEnrollment } from "@/context/EnrollmentContext";
import { useAuth } from "@/hooks/useAuth";
import { paymentService } from "@/services/paymentService";

const PaymentFailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get("id");
    const orderCode = queryParams.get("orderCode");
    const status = queryParams.get("status");
    const code = queryParams.get("code");
    const { refreshEnrollments } = useEnrollment();
    const { user } = useAuth();
    const [courseInfo, setCourseInfo] = useState();
    const handleContinue = () => {
        refreshEnrollments();
        navigate(`/dashboard`);
    };

    const createPayment = async () => {
        await paymentService.createPaymentIntent({
            orderId: orderId,
            orderCode: orderCode,
            userId: user._id,
            courseId: courseInfo.courseId,
            amount: courseInfo.coursePrice,
            status: status === "CANCELLED" ? "cancelled" : "failed",
            paymentDate: Date.now(),
            paymentMethod: "bank_transfer",
        });
    };

    useEffect(() => {
        const savedInfo = localStorage.getItem("payment_course_info");
        console.log("savedInfo", savedInfo);
        if (savedInfo) {
            setCourseInfo(JSON.parse(savedInfo));
        }
        createPayment();
    }, [orderId]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl text-center bg-white p-8 sm:p-12 rounded-xl shadow-lg">
                <CheckCircle2 className="mx-auto h-16 w-16 text-red-500 mb-6" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Payment Fail!</h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. Your payment has been cancel!
                </p>

                <div className="bg-gray-50 rounded-lg p-6 text-left space-y-4 mb-8 border">
                    <div className="flex justify-between">
                        <span className="text-gray-500">OrderID:</span>
                        <span className="font-medium text-gray-800">{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Course Title:</span>
                        <span className="font-medium text-gray-800">{courseInfo?.courseTitle}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Course Price:</span>
                        <span className="font-medium text-gray-800">
                            {courseInfo?.coursePrice?.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            })}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Order Code:</span>
                        <span className="font-medium text-gray-800">{orderCode}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="font-medium text-gray-800">{status}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Code:</span>
                        <span className="font-medium text-gray-800">{code}</span>
                    </div>
                </div>

                <Button
                    size="lg"
                    onClick={handleContinue}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
                >
                    Continue Learning
                </Button>
            </div>
        </div>
    );
};

export default PaymentFailPage;
