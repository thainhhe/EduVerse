import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useEnrollment } from "@/context/EnrollmentContext";

const PaymentConfirmationPage = () => {
  const navigate = useNavigate()

  const { refreshEnrollments } = useEnrollment();
  // Dữ liệu này sẽ được truyền từ trang trước hoặc lấy từ API
  const transactionDetails = {
    courseName: "Advanced React Development",
    transactionId: "TXN-83749201-XYZ",
    amountPaid: 199.99,
  };
  const handleContinue = () => {
    // Có thể gọi refresh 1 lần nữa trước khi đi
    refreshEnrollments();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center bg-white p-8 sm:p-12 rounded-xl shadow-lg">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-6" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your payment has been processed
          successfully.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 text-left space-y-4 mb-8 border">
          <div className="flex justify-between">
            <span className="text-gray-500">Course Name:</span>
            <span className="font-medium text-gray-800">
              {transactionDetails.courseName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction ID:</span>
            <span className="font-medium text-gray-800">
              {transactionDetails.transactionId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount Paid:</span>
            <span className="font-medium text-gray-800">
              ${transactionDetails.amountPaid}
            </span>
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
