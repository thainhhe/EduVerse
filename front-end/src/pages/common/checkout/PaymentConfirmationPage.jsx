import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollment } from "@/context/EnrollmentContext";
import { enrollmentService } from "@/services/enrollmentService";
import { paymentService } from "@/services/paymentService";
import { ToastHelper } from "@/helper/ToastHelper";

const PaymentConfirmationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get("id");
    const orderCode = queryParams.get("orderCode");
    const status = queryParams.get("status");
    const code = queryParams.get("code");
    const { user } = useAuth();

    const [courseInfo, setCourseInfo] = useState({});
    const { refreshEnrollments } = useEnrollment();
    // console.log("user", user);
    const hasProcessedRef = useRef(false);

    useEffect(() => {
        const savedInfo = localStorage.getItem("payment_course_info");
        console.log("savedInfo", savedInfo);
        if (savedInfo) {
            setCourseInfo(JSON.parse(savedInfo));
        }
    }, []);

    useEffect(() => {
        const processPaymentAndEnrollment = async () => {
            if (!user?._id || !courseInfo?.courseId || status !== "PAID") return;

            if (hasProcessedRef.current) return;
            hasProcessedRef.current = true;

            console.log("Processing payment for:", { user, courseInfo });

            try {
                // Create Enrollment
                await enrollmentService.createEnrollment({
                    userId: user._id,
                    courseId: courseInfo.courseId,
                    enrollmentDate: Date.now(),
                    status: "enrolled",
                    grade: "Incomplete",
                });

                // Create Payment Record
                await paymentService.createPaymentIntent({
                    orderId: orderId,
                    orderCode: orderCode,
                    userId: user._id,
                    courseId: courseInfo.courseId,
                    amount: courseInfo.coursePrice,
                    status: "paid",
                    paymentDate: Date.now(),
                    paymentMethod: "bank_transfer",
                });

                ToastHelper.success("Thanh toán và ghi danh thành công!");
            } catch (error) {
                console.error("Error processing payment/enrollment:", error);
                ToastHelper.error("Có lỗi xảy ra khi xử lý thanh toán.");
                hasProcessedRef.current = false; // Allow retry on error? Or keep it to prevent spam?
                // Better to keep it true to avoid partial state, but here we might want to retry.
                // For now, let's leave it true to prevent double-charging logic, but user can refresh.
            }
        };

        processPaymentAndEnrollment();
    }, [status, courseInfo, user, orderId, orderCode]);

    const handleContinue = () => {
        refreshEnrollments();
        navigate(`/dashboard`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl text-center bg-white p-8 sm:p-12 rounded-xl shadow-lg">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-6" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. Your payment has been processed successfully.
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
                        <span className="font-medium text-gray-800">${status}</span>
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

export default PaymentConfirmationPage;
