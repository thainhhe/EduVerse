import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@services/authService";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

const ForgotPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success("Link đặt lại mật khẩu đã được gửi!");
      setIsEmailSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
    }
  };

  const renderContent = () => {
    if (isEmailSent) {
      return (
        <div className="text-center">
          <div className="mb-6">
            <img
              src="/check-mail.png"
              alt="Check Email"
              className="w-24 h-24 mx-auto"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Check your email!
          </h1>
          <p className="text-gray-600 max-w-sm mb-6">
            An email was sent that will ask you to click on a link to verify
            that you own this account.
          </p>
          <Button size="lg" className="w-full max-w-xs mb-4">
            Open email inbox
          </Button>
          <Button variant="link" className="text-gray-600">
            Resend email
          </Button>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <img
            src="/forgot-password.png"
            alt="Forgot Password"
            className="w-24 h-24 mx-auto"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Forgot your password?
        </h1>
        <p className="text-gray-600 mb-8">
          Enter your email so that we can send you a password reset link.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. username@kinety.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Email"}
          </Button>
        </form>

        <Button variant="link" asChild className="mt-6 text-gray-600">
          <Link to="/login">
            <FaArrowLeft className="mr-2" /> Back to Login
          </Link>
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white p-6 sm:p-10 rounded-xl shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default ForgotPassword;
