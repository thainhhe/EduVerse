import { useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authService from "@/services/authService";
import { toast } from "react-toastify";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { token: paramToken } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();

  // support token from path or query
  const qp = new URLSearchParams(search);
  const token = paramToken || qp.get("token") || qp.get("t");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword(token, data.password);
      toast.success("Password changed successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired link.");
    }
  };

  const renderContent = () => {
    if (isSuccess) {
      return (
        <div className="text-center">
          <div className="mb-6">
            <img
              src="/password-changed.png"
              alt="Success"
              className="w-24 h-24 mx-auto"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Password changed!
          </h1>
          <p className="text-gray-600 mb-6">
            You've successfully completed your password reset.
          </p>
          <Button size="lg" className="w-full max-w-xs" asChild>
            <Link to="/login">Log In Now</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <img
            src="/reset-password.png"
            alt="Reset Password"
            className="w-24 h-24 mx-auto"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Reset password</h1>
        <p className="text-gray-600 mb-8">
          Please kindly set your new password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Re-enter password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
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

export default ResetPassword;
