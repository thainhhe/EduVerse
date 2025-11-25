import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerLearnerSchema } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // added

const RegisterLearner = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerLearnerSchema),
  });

  const [showPassword, setShowPassword] = useState(false); // added
  const [showConfirm, setShowConfirm] = useState(false); // added

  const onSubmit = async (data) => {
    try {
      const result = await registerUser({
        username: data.fullName, // send username to match backend validator
        email: data.email,
        password: data.password,
        role: "learner",
      });

      if (result.success) {
        navigate("/login");
      } else {
        // if service returns validation-like payload
        if (result?.errors) {
          Object.keys(result.errors).forEach((k) => {
            const msg = result.errors[k];
            const field = k === "username" ? "fullName" : k;
            setError(field, { type: "server", message: msg });
          });
        } else if (result?.message) {
          toast.error(result.message);
        }
      }
    } catch (err) {
      // axios / network error -> inspect and map server-side validation
      const res = err.response?.data;
      if (res?.errors && typeof res.errors === "object") {
        for (const key in res.errors) {
          if (!Object.prototype.hasOwnProperty.call(res.errors, key)) continue;
          const message = res.errors[key] || String(res.errors[key]);
          const field = key === "username" ? "fullName" : key;
          setError(field, { type: "server", message });
        }
      } else if (res?.message) {
        toast.error(res.message);
      } else {
        toast.error(err.message || "Registration failed");
      }
      // keep console for debugging
      // eslint-disable-next-line no-console
      console.error("Register error:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-50 to-purple-50 items-center justify-center p-12">
        <img
          src="/Selection.png"
          alt="Students learning together"
          className="max-w-full h-auto"
        />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-2">
              Create Your Learner Account
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Start your learning journey with us today!
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            autoComplete="off"
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name<span className="text-red-500 -ml-1">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Full Name"
                {...register("fullName")}
                required
                maxLength={50}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address<span className="text-red-500 -ml-1">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                {...register("email")}
                required
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Responsive grid for passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password<span className="text-red-500 -ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="pr-10"
                    {...register("password")}
                    required
                    minLength={6}
                    maxLength={50}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password<span className="text-red-500 -ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Password"
                    className="pr-10"
                    {...register("confirmPassword")}
                    required
                    minLength={6}
                    maxLength={50}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="agreeTerms"
                {...register("agreeTerms", {
                  // normalize checkbox value to boolean (handles "on" / "true" / true)
                  setValueAs: (v) => v === "on" || v === "true" || v === true,
                })}
                className="mt-1"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                By signing up, I agree with the{" "}
                <Link to="/terms" className="text-indigo-600 hover:underline">
                  Terms of Use
                </Link>{" "}
                &{" "}
                <Link to="/privacy" className="text-indigo-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-sm text-red-600">
                {errors.agreeTerms.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#4F39F6] text-white hover:bg-[#3e2adf] focus:ring-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing up..." : "Sign up"}
            </Button>

            <p className="text-center text-sm text-gray-600 pt-2">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterLearner;
