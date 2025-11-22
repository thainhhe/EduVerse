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
      await authService.verifyOtp(body);

      // Thay đổi: thông báo người dùng check email và redirect về login
      toast.success("OTP verified. Check your email for the new password.");
      navigate("/login");
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
            autoComplete="off" // <-- thêm
          >
            {/* Hidden dummy email để trình duyệt autofill vào chỗ khác */}
            <input
              type="email"
              name="username"
              defaultValue={sentEmail}
              autoComplete="username"
              tabIndex={-1}
              style={{
                position: "absolute",
                left: -9999,
                width: 1,
                height: 1,
                overflow: "hidden",
              }}
              readOnly
            />

            <div className="space-y-2">
              <Label htmlFor="otp">
                Enter OTP<span className="text-red-500 -ml-1">*</span>
              </Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter code from email"
                {...registerOtp("otp")}
                spellCheck="false"
                onFocus={(e) => {
                  // remove readonly attribute if browser put it; prevents some autofill behaviors
                  e.currentTarget.removeAttribute("readonly");
                }}
                readOnly // keep readonly until focused to reduce autofill
              />
              {otpErrors.otp && (
                <p className="text-sm text-red-500">{otpErrors.otp.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                size="lg"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={otpSubmitting}
              >
                {otpSubmitting ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={otpSubmitting}
                className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
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
            <Label htmlFor="email">
              Email<span className="text-red-500 -ml-1">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
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
