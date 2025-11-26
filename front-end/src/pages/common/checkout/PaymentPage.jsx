// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card } from "@/components/ui/card";
// import { Lock, CheckCircle2 } from "lucide-react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "@/hooks/useAuth";
// import { enrollmentService } from "@/services/enrollmentService";
// import { ToastHelper } from "@/helper/ToastHelper";
// import { paymentService } from "@/services/paymentService";
// import axios from "axios";

// const paymentSchema = z.object({
//     // fullName: z.string().min(1, "Full name is required"),
//     email: z.string().email("Invalid email address"),
//     course: z.string().min(1, "Please select a course"),
//     paymentType: z.string(),
//     // cardNumber: z.string().min(16, "Invalid card number").max(16, "Invalid card number"),
//     // expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid format (MM/YY)"),
//     // cvv: z.string().min(3, "Invalid CVV").max(4, "Invalid CVV"),
//     // streetAddress: z.string().min(1, "Street address is required"),
//     // city: z.string().min(1, "City is required"),
//     // state: z.string().min(1, "State is required"),
//     // zipCode: z.string().min(1, "Zip code is required"),
//     country: z.string(),
// });

// const PaymentPage = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     console.log("user", user);
//     // 🔹 Lấy dữ liệu khóa học từ state
//     const { courseId, courseTitle, coursePrice } = location.state || {};
//     // const {
//     //     register,
//     //     handleSubmit,
//     //     formState: { errors, isSubmitting },
//     // } = useForm({
//     //     resolver: zodResolver(paymentSchema),
//     //     defaultValues: {
//     //         fullName: user?.userName || "",
//     //         email: user?.email || "",
//     //         course: courseTitle,
//     //         streetAddress: "",
//     //         city: "",
//     //         state: "",
//     //         zipCode: "",
//     //         country: "Vietnam",
//     //     },
//     // });
//     const onSubmit = async () => {
//         try {
//             // console.log("submit data:", data);
//             const data_payment = {
//                 userId: user._id,
//                 courseId: courseId,
//                 total_amount: coursePrice,
//                 description: `Payment for course: ${courseTitle}`,
//             };
//             console.log("✅ Payment data:", data_payment);
//             const res = await axios.post("http://localhost:9999/api/v1/payment/create", data_payment);
//             log("res", res);
//             if (!res?.status !== 200) {
//                 throw new Error(res?.message || "Payment intent creation failed");
//             }
//             const paymentLinkIntent = res.data.data.paymentLink;
//             window.open(paymentLinkIntent, "_blank");
//             // 🔹 1️⃣ Giả lập thanh toán thành công → tạo enrollment
//             // await enrollmentService.createEnrollment({
//             //     userId: user._id,
//             //     courseId,
//             //     enrollmentDate: Date.now(),
//             //     status: "enrolled",
//             //     grade: "Incomplete",
//             // });

//             // ✅ Hiển thị thông báo đẹp bằng ToastHelper
//             // ToastHelper.success("Thanh toán thành công! Bạn đã được ghi danh vào khóa học.", {
//             //     courseId,
//             //     user,
//             // });

//             // 🔹 Điều hướng sau khi thanh toán thành công
//             // navigate("/checkout/success");
//         } catch (err) {
//             console.error("❌ Lỗi khi thanh toán:", err);

//             // ❌ Hiển thị thông báo lỗi
//             ToastHelper.error("Thanh toán thất bại. Vui lòng thử lại.", err);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//             {/* Header */}
//             <div className="border-b border-slate-200 bg-white">
//                 <div className="container mx-auto px-4 py-6">
//                     <div className="flex items-center gap-2">
//                         <Lock className="w-5 h-5 text-slate-900" />
//                         <h1 className="text-xl font-semibold text-slate-900">Secure Payment</h1>
//                     </div>
//                 </div>
//             </div>

//             <div className="container mx-auto px-4 py-12">
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     {/* Left Section - Order Summary */}
//                     <div className="lg:col-span-1">
//                         <Card className="sticky top-8 bg-white border-slate-200">
//                             <div className="p-6">
//                                 <h2 className="text-lg font-semibold text-slate-900 mb-6">Order Summary</h2>

//                                 <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
//                                     <div className="flex items-start gap-3">
//                                         <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
//                                         <div>
//                                             <p className="text-sm font-medium text-slate-900">{courseTitle}</p>
//                                             <p className="text-xs text-slate-500 mt-1">
//                                                 Full access to course materials
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-3">
//                                     <div className="flex justify-between text-sm">
//                                         <span className="text-slate-600">Subtotal</span>
//                                         <span className="text-slate-900 font-medium">
//                                             {new Intl.NumberFormat("vi-VN", {
//                                                 style: "currency",
//                                                 currency: "VND",
//                                             }).format(coursePrice)}
//                                         </span>
//                                     </div>
//                                     <div className="flex justify-between text-sm">
//                                         <span className="text-slate-600">Tax</span>
//                                         <span className="text-slate-900 font-medium">0 ₫</span>
//                                     </div>
//                                     <div className="pt-3 border-t border-slate-200 flex justify-between">
//                                         <span className="font-semibold text-slate-900">Total</span>
//                                         <span className="text-lg font-bold text-slate-900">
//                                             {new Intl.NumberFormat("vi-VN", {
//                                                 style: "currency",
//                                                 currency: "VND",
//                                             }).format(coursePrice)}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </Card>
//                     </div>

//                     {/* Right Section - Form */}
//                     <div className="lg:col-span-2">
//                         <Card className="bg-white border-slate-200">
//                             <div className="p-8">
//                                 <form className="space-y-8">
//                                     {/* Personal Information */}
//                                     <div>
//                                         <h3 className="text-base font-semibold text-slate-900 mb-4">
//                                             Personal Information
//                                         </h3>
//                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                             <div>
//                                                 <Label
//                                                     htmlFor="fullName"
//                                                     className="text-sm font-medium text-slate-700"
//                                                 >
//                                                     Full Name
//                                                 </Label>
//                                                 <Input
//                                                     id="fullName"
//                                                     // {...register("fullName")}
//                                                     className="mt-2 border-slate-300 focus:border-slate-900"
//                                                     value={user.username}
//                                                 />
//                                                 {/* {errors.fullName && (
//                                                     <p className="text-xs text-red-500 mt-1">
//                                                         {errors.fullName.message}
//                                                     </p>
//                                                 )} */}
//                                             </div>
//                                             <div>
//                                                 <Label htmlFor="email" className="text-sm font-medium text-slate-700">
//                                                     Email Address
//                                                 </Label>
//                                                 <Input
//                                                     id="email"
//                                                     type="email"
//                                                     // {...register("email")}
//                                                     className="mt-2 border-slate-300 focus:border-slate-900"
//                                                     placeholder="john@example.com"
//                                                     value={user.email}
//                                                 />
//                                                 {/* {errors.email && (
//                                                     <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
//                                                 )} */}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Course Selection */}
//                                     <div>
//                                         <h3 className="text-base font-semibold text-slate-900 mb-4">Course Details</h3>
//                                         <div className="mt-2 flex h-10 w-full items-center rounded-md border border-slate-300 bg-gray-50 px-3 text-sm text-slate-900">
//                                             {courseTitle}
//                                         </div>
//                                     </div>

//                                     {/* Payment Method */}
//                                     <div>
//                                         <h3 className="text-base font-semibold text-slate-900 mb-4">Payment Method</h3>
//                                         <div className="space-y-4">
//                                             <div>
//                                                 <Label
//                                                     htmlFor="paymentType"
//                                                     className="text-sm font-medium text-slate-700"
//                                                 >
//                                                     Payment Type
//                                                 </Label>
//                                                 <select
//                                                     id="paymentType"
//                                                     // {...register("paymentType")}
//                                                     className="mt-2 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
//                                                 >
//                                                     <option value="Credit Card">Credit Card</option>
//                                                     <option value="PayPal">PayPal</option>
//                                                 </select>
//                                             </div>
//                                             <div>
//                                                 <Label
//                                                     htmlFor="cardNumber"
//                                                     className="text-sm font-medium text-slate-700"
//                                                 >
//                                                     Card Number
//                                                 </Label>
//                                                 <Input
//                                                     id="cardNumber"
//                                                     placeholder="1234 5678 9012 3456"
//                                                     // {...register("cardNumber")}
//                                                     className="mt-2 border-slate-300 focus:border-slate-900"
//                                                 />
//                                                 {/* {errors.cardNumber && (
//                                                     <p className="text-xs text-red-500 mt-1">
//                                                         {errors.cardNumber.message}
//                                                     </p>
//                                                 )} */}
//                                             </div>
//                                             <div className="grid grid-cols-2 gap-4">
//                                                 <div>
//                                                     <Label
//                                                         htmlFor="expiryDate"
//                                                         className="text-sm font-medium text-slate-700"
//                                                     >
//                                                         Expiry Date
//                                                     </Label>
//                                                     <Input
//                                                         id="expiryDate"
//                                                         placeholder="MM/YY"
//                                                         // {...register("expiryDate")}
//                                                         className="mt-2 border-slate-300 focus:border-slate-900"
//                                                     />
//                                                     {/* {errors.expiryDate && (
//                                                         <p className="text-xs text-red-500 mt-1">
//                                                             {errors.expiryDate.message}
//                                                         </p>
//                                                     )} */}
//                                                 </div>
//                                                 <div>
//                                                     <Label htmlFor="cvv" className="text-sm font-medium text-slate-700">
//                                                         CVV
//                                                     </Label>
//                                                     <Input
//                                                         id="cvv"
//                                                         placeholder="123"
//                                                         // {...register("cvv")}
//                                                         className="mt-2 border-slate-300 focus:border-slate-900"
//                                                     />
//                                                     {/* {errors.cvv && (
//                                                         <p className="text-xs text-red-500 mt-1">
//                                                             {errors.cvv.message}
//                                                         </p>
//                                                     )} */}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Billing Address */}
//                                     {/* <div>
//                     <h3 className="text-base font-semibold text-slate-900 mb-4">Billing Address</h3>
//                     <div className="space-y-4">
//                       <div>
//                         <Label htmlFor="streetAddress" className="text-sm font-medium text-slate-700">
//                           Street Address
//                         </Label>
//                         <Input
//                           id="streetAddress"
//                           {...register("streetAddress")}
//                           className="mt-2 border-slate-300 focus:border-slate-900"
//                           placeholder="123 Main Street"
//                         />
//                         {errors.streetAddress && (
//                           <p className="text-xs text-red-500 mt-1">{errors.streetAddress.message}</p>
//                         )}
//                       </div>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="city" className="text-sm font-medium text-slate-700">
//                             City
//                           </Label>
//                           <Input
//                             id="city"
//                             {...register("city")}
//                             className="mt-2 border-slate-300 focus:border-slate-900"
//                             placeholder="New York"
//                           />
//                           {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
//                         </div>
//                         <div>
//                           <Label htmlFor="state" className="text-sm font-medium text-slate-700">
//                             State
//                           </Label>
//                           <Input
//                             id="state"
//                             {...register("state")}
//                             className="mt-2 border-slate-300 focus:border-slate-900"
//                             placeholder="NY"
//                           />
//                           {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="zipCode" className="text-sm font-medium text-slate-700">
//                             Zip Code
//                           </Label>
//                           <Input
//                             id="zipCode"
//                             {...register("zipCode")}
//                             className="mt-2 border-slate-300 focus:border-slate-900"
//                             placeholder="10001"
//                           />
//                           {errors.zipCode && <p className="text-xs text-red-500 mt-1">{errors.zipCode.message}</p>}
//                         </div>
//                         <div>
//                           <Label htmlFor="country" className="text-sm font-medium text-slate-700">
//                             Country
//                           </Label>
//                           <select
//                             id="country"
//                             {...register("country")}
//                             className="mt-2 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
//                           >
//                             <option value="United States">United States</option>
//                             <option value="Vietnam">Vietnam</option>
//                           </select>
//                         </div>
//                       </div>
//                     </div>
//                   </div> */}

//                                     {/* Submit Button */}
//                                     <Button
//                                         // type="submit"
//                                         size="lg"
//                                         className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11"
//                                         // disabled={isSubmitting}
//                                         onClick={onSubmit}
//                                     >
//                                         {/* {isSubmitting ? "Processing..." : "Complete Payment"} */}Payment
//                                     </Button>

//                                     <p className="text-xs text-slate-500 text-center">
//                                         Your payment information is secure and encrypted
//                                     </p>
//                                 </form>
//                             </div>
//                         </Card>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PaymentPage;

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

    console.log("courseId, courseTitle, coursePrice", courseId, courseTitle, coursePrice)
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
                description: `${courseTitle.length > 24 ? courseTitle.substring(0, 21) + "..." : courseTitle}`,
            };

            // console.log("✅ Payment data:", data_payment);
            const res = await paymentService.createPaymentIntent(data_payment);
            console.log("res:", res);
            const paymentLinkIntent = res.data?.checkoutUrl;
            console.log("paymentLinkIntent", paymentLinkIntent)
            if (paymentLinkIntent) {

                localStorage.setItem("payment_course_info", JSON.stringify({
                    courseId,
                    courseTitle,
                    coursePrice,
                }))
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
                                            <p className="text-sm font-medium text-slate-900">{courseTitle}</p>
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
                                                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
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
                                        <h3 className="text-base font-semibold text-slate-900 mb-4">Course Details</h3>
                                        <div className="mt-2 flex h-10 w-full items-center rounded-md border border-slate-300 bg-gray-50 px-3 text-sm text-slate-900">
                                            {courseTitle}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={onSubmit}
                                        size="lg"
                                        className="w-full bg-indigo-600 hover:bg-indigo-800 text-white font-medium h-11"
                                    >
                                        Thanh toán
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
