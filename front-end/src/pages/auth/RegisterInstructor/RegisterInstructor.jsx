import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@hooks/useAuth";
import { registerInstructorSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";

const SUBJECT_OPTIONS = [
  "Marketing",
  "Programming",
  "Design",
  "Business",
  "Math",
  "Physics",
];

const MultiSelectDropdown = ({ value = [], onChange, options = [] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const toggle = (opt) => {
    const exists = Array.isArray(value) && value.includes(opt);
    const next = exists
      ? value.filter((v) => v !== opt)
      : [...(value || []), opt];
    onChange(next);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left h-10 rounded-md border border-input bg-gray-50 px-3 py-2 text-sm flex items-center justify-between"
      >
        <span className="truncate">
          {Array.isArray(value) && value.length > 0
            ? value.join(", ")
            : "Select subject(s)"}
        </span>
        <div className="flex items-center gap-2">
          {Array.isArray(value) && value.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-500 mr-2"
            >
              Clear
            </button>
          )}
          <svg
            className="w-4 h-4 text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-56 overflow-auto">
          <div className="p-2">
            {options.map((opt) => {
              const checked = Array.isArray(value) && value.includes(opt);
              return (
                <label
                  key={opt}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const RegisterInstructor = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerInstructorSchema),
    mode: "onBlur", // validate on blur and submit
    defaultValues: {
      subjects: [], // keep internal value as array
    },
  });

  // sync watched subjects for MultiSelectDropdown
  const watchedSubjects = watch("subjects") || [];

  // ensure form field exists
  useEffect(() => {
    setValue("subjects", Array.isArray(watchedSubjects) ? watchedSubjects : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    // normalize subjects -> string for backend model
    const subjectsArray = Array.isArray(data.subjects)
      ? data.subjects
      : data.subjects
      ? [data.subjects]
      : [];

    const subjectString = subjectsArray.length ? subjectsArray.join(",") : "";

    // normalize job title to backend enum (lowercase) or null
    let normalizedJobTitle = data.jobTitle
      ? String(data.jobTitle).trim().toLowerCase()
      : null;
    if (
      normalizedJobTitle &&
      !["manager", "professor", "instructor"].includes(normalizedJobTitle)
    ) {
      normalizedJobTitle = null;
    }

    const payload = {
      username: data.fullName,
      email: data.email,
      password: data.password,
      role: "instructor",

      // fields matching backend model
      job_title: normalizedJobTitle, // string or null
      subject_instructor: subjectString, // comma-separated string (matches current model type)
    };

    const result = await registerUser(payload);
    if (result?.success) {
      setTimeout(() => navigate("/login"), 600);
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
          <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600 text-center mb-2">
            Create Your Instructor Account
          </h2>
          <p className="text-gray-600 text-center mb-8 text-sm">
            Start building and sharing your courses with students across the
            globe.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Full Name"
                className={`bg-gray-50 ${
                  errors.fullName ? "border-red-500 ring-1 ring-red-500" : ""
                }`}
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
                className={`bg-gray-50 ${
                  errors.email ? "border-red-500 ring-1 ring-red-500" : ""
                }`}
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

              <MultiSelectDropdown
                options={SUBJECT_OPTIONS}
                value={watchedSubjects}
                onChange={(next) =>
                  setValue("subjects", next, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />

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

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="agreeTerms"
                {...register("agreeTerms", {
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

            <Button
              type="submit"
              className="w-full bg-[#4F39F6] text-white hover:bg-[#3e2adf] focus:ring-0"
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
