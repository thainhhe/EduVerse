import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const paymentSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  course: z.string().min(1, "Please select a course"),
  paymentType: z.string(),
  cardNumber: z
    .string()
    .min(16, "Invalid card number")
    .max(16, "Invalid card number"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid format (MM/YY)"),
  cvv: z.string().min(3, "Invalid CVV").max(4, "Invalid CVV"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string(),
});

const PaymentPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = (data) => {
    console.log("Payment data:", data);
    // TODO: Gửi dữ liệu thanh toán đến backend
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Section */}
          <div className="lg:col-span-2 bg-indigo-50 p-8 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Secure Your Course Enrollment
            </h2>
            <p className="text-gray-600 mb-6">
              Finalize your learning journey with our secure payment system. We
              prioritize your financial safety and ensure a smooth transaction
              process for all your chosen courses.
            </p>
            <img
              src="/images/secure-payment-illustration.png" // Bạn cần có ảnh này trong /public/images
              alt="Secure Payment"
              className="w-full max-w-sm mx-auto"
            />
          </div>

          {/* Right Section - Form */}
          <div className="lg:col-span-3 bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Course Payment Information
            </h2>
            <p className="text-gray-600 mb-8">
              Please fill in your details to complete the payment securely.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...register("fullName")} />
                    {errors.fullName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div>
                <Label htmlFor="course">Course Details</Label>
                <select
                  id="course"
                  {...register("course")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Web Development Fundamentals">
                    Web Development Fundamentals
                  </option>
                  <option value="Advanced React">Advanced React</option>
                </select>
                {errors.course && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.course.message}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Payment Method</h3>
                <div>
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <select
                    id="paymentType"
                    {...register("paymentType")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="XXXX XXXX XXXX XXXX"
                    {...register("cardNumber")}
                  />
                  {errors.cardNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.cardNumber.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      {...register("expiryDate")}
                    />
                    {errors.expiryDate && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.expiryDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="XXX" {...register("cvv")} />
                    {errors.cvv && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.cvv.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Billing Address</h3>
                <div>
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input id="streetAddress" {...register("streetAddress")} />
                  {errors.streetAddress && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.streetAddress.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} />
                    {errors.city && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...register("state")} />
                    {errors.state && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" {...register("zipCode")} />
                    {errors.zipCode && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.zipCode.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <select
                      id="country"
                      {...register("country")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="United States">United States</option>
                      <option value="Vietnam">Vietnam</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Submit Payment"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
