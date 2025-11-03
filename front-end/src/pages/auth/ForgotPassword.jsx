import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authService from "@/services/authService";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

const otpSchema = z.object({
  otp: z.string().min(3, "Invalid code"),
});

const ForgotPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success("Password reset OTP has been sent to your email!");
      setIsEmailSent(true);
      setSentEmail(data.email);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  const onVerifyOtp = async (payload) => {
    if (!sentEmail) return toast.error("Missing email");
    setOtpSubmitting(true);
    try {
      const body = { email: sentEmail, otp: payload.otp };
      const res = await authService.verifyOtp(body);
      toast.success("OTP verified. Redirecting to reset password...");

      // try extract token from response (be flexible)
      const token =
        (res && (res.token || res.accessToken || res.data?.token)) || null;

      if (token) {
        navigate(`/reset-password?token=${encodeURIComponent(token)}`);
      } else {
        // if backend doesn't return token, navigate to reset page letting user enter new password (frontend may accept OTP)
        navigate(
          `/reset-password?email=${encodeURIComponent(
            sentEmail
          )}&otp=${encodeURIComponent(payload.otp)}`
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!sentEmail) return toast.error("No email to resend to");
    try {
      await authService.forgotPassword(sentEmail);
      toast.success("OTP resent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend failed");
    }
  };

  const renderContent = () => {
    if (isEmailSent) {
      return (
        <div className="w-full max-w-md text-center">
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
            We sent an OTP to <strong>{sentEmail}</strong>. Enter it below to
            verify and reset your password.
          </p>

          <form
            onSubmit={handleSubmitOtp(onVerifyOtp)}
            className="space-y-6 text-left"
          >
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter code from email"
                {...registerOtp("otp")}
              />
              {otpErrors.otp && (
                <p className="text-sm text-red-500">{otpErrors.otp.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={otpSubmitting}
              >
                {otpSubmitting ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={otpSubmitting}
              >
                Resend
              </Button>
            </div>
          </form>

          <Button variant="link" asChild className="mt-6 text-gray-600">
            <Link to="/login">
              <FaArrowLeft className="mr-2" /> Back to Login
            </Link>
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
          Enter your email so that we can send you a password reset OTP.
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
