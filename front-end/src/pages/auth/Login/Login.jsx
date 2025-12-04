import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@hooks/useAuth";
import { loginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import authService from "@/services/authService";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSignupMenu, setShowSignupMenu] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const signupRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setValue("email", savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  // Close signup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (signupRef.current && !signupRef.current.contains(e.target)) {
        setShowSignupMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTrimAndValidate = (fieldName) => {
    const val = getValues(fieldName) || "";
    const trimmed = val.trim();
    if (trimmed !== val) {
      setValue(fieldName, trimmed, { shouldValidate: true, shouldDirty: true });
    } else {
      trigger(fieldName);
    }
  };

  const onSubmit = async (data) => {
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", data.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    const result = await login(data.email, data.password);
    if (result.success) {
      const role = result.user?.role || user?.role || "learner";
      if (role === "instructor") {
        navigate("/mycourses");
      } else {
        navigate("/dashboard");
      }
    }
  };

  const onGoogleSignIn = () => {
    authService.googleSignIn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 bg-white shadow-xl rounded-2xl overflow-visible">
        <div className="hidden lg:flex bg-gradient-to-br from-indigo-600 to-purple-600 items-center justify-center p-8">
          <img
            src="/login.png"
            alt="Online learning"
            className="w-full max-w-md"
          />
        </div>
        <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-6 text-center lg:text-left">
            Sign in
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
            autoComplete="off"
          >
            <div className="space-y-2">
              <Label htmlFor="email">
                Email<span className="text-red-500 -ml-1">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example.email@gmail.com"
                className="bg-gray-50"
                {...register("email")}
                onBlur={() => handleTrimAndValidate("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password<span className="text-red-500 -ml-1">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter at least 6 characters"
                  className="bg-gray-50 pr-10"
                  {...register("password")}
                  onBlur={() => trigger("password")}
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
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#4F39F6] text-white hover:bg-[#3e2adf] focus:ring-0"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or sign in with
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 bg-white hover:bg-gray-50"
              >
                <FcGoogle className="w-5 h-5" size={20} />
                Continue with Google
              </button>
            </div>

            <div className="text-center text-sm text-gray-600 pt-2 relative">
              <span>Don't have an account? </span>
              <div className="inline-block relative" ref={signupRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSignupMenu(!showSignupMenu);
                  }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Sign up
                </button>

                {showSignupMenu && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border rounded-md shadow-lg z-[9999]">
                    <Link
                      to="/register-learner"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                      onClick={() => setShowSignupMenu(false)}
                    >
                      Sign up as Learner
                    </Link>
                    <Link
                      to="/register-instructor"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md"
                      onClick={() => setShowSignupMenu(false)}
                    >
                      Sign up as Instructor
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
