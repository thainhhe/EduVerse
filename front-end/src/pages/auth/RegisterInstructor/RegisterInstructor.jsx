import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@hooks/useAuth";
import { registerInstructorSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterInstructor = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerInstructorSchema),
    defaultValues: {
      subjects: [],
    },
  });

  const onSubmit = async (data) => {
    const result = await registerUser({
      name: data.fullName,
      email: data.email,
      password: data.password,
      role: "instructor",
      subjects: data.subjects,
      jobTitle: data.jobTitle,
    });

    if (result.success) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:flex items-center justify-center">
          <img
            src="/Selection.png"
            alt="Instructors collaborating"
            className="w-full max-w-lg"
          />
        </div>

        <div className="bg-white p-6 sm:p-8 lg:p-12 rounded-2xl shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-2">
            Create Your Instructor Account
          </h2>
          <p className="text-gray-600 text-center mb-8 text-sm">
            Start building and sharing your courses with students across the
            globe.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Full Name"
                className="bg-gray-50"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                className="bg-gray-50"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="bg-gray-50 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Password"
                    className="bg-gray-50 pr-10"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjects">Subject(s) You Want to Teach</Label>
              <select
                id="subjects"
                className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm"
                {...register("subjects")}
                multiple
              >
                <option value="Marketing">Marketing</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
              </select>
              {errors.subjects && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.subjects.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <select
                id="jobTitle"
                className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm"
                {...register("jobTitle")}
              >
                <option value="">Select a job title</option>
                <option value="Manager">Manager</option>
                <option value="Professor">Professor</option>
                <option value="Instructor">Instructor</option>
              </select>
              {errors.jobTitle && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.jobTitle.message}
                </p>
              )}
            </div>

            <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer pt-2">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                required
              />
              <span>
                I agree with the{" "}
                <Link
                  to="/terms"
                  className="text-primary font-medium hover:underline"
                >
                  Terms of Use
                </Link>{" "}
                &{" "}
                <Link
                  to="/privacy"
                  className="text-primary font-medium hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing up..." : "Sign up"}
            </Button>

            <p className="text-center text-sm text-gray-600 pt-2">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
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

export default RegisterInstructor;
