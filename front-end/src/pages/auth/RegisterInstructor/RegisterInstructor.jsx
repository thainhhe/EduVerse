import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@hooks/useAuth";
import { registerInstructorSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, X } from "lucide-react";

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
        className="w-full text-left min-h-[40px] rounded-md border border-input bg-gray-50 px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-100/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <div className="flex flex-wrap gap-1">
          {Array.isArray(value) && value.length > 0 ? (
            value.map((v) => (
              <span
                key={v}
                className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                {v}
                <span
                  className="cursor-pointer hover:text-indigo-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(v);
                  }}
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">Select subject(s)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {Array.isArray(value) && value.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-gray-700 mr-1"
            >
              Clear
            </button>
          )}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1">
            {options.map((opt) => {
              const checked = Array.isArray(value) && value.includes(opt);
              return (
                <div
                  key={opt}
                  onClick={() => toggle(opt)}
                  className={`flex items-center gap-2 p-2 rounded-sm cursor-pointer text-sm transition-colors ${
                    checked
                      ? "bg-indigo-50 text-indigo-900"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      checked
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {checked && <X className="w-3 h-3 rotate-45" />}
                  </div>
                  <span>{opt}</span>
                </div>
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
    control,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerInstructorSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      subjects: [],
      jobTitle: "",
      agreeTerms: true,
    },
  });

  // Helper to trim and validate field
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
    const subjectsArray = Array.isArray(data.subjects) ? data.subjects : [];
    const subjectString = subjectsArray.join(",");

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
      job_title: normalizedJobTitle,
      subject_instructor: subjectString,
    };

    const result = await registerUser(payload);
    if (result?.success) {
      setTimeout(() => navigate("/login"), 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:flex flex-col items-center justify-center space-y-6">
          <img
            src="/Selection.png"
            alt="Instructors collaborating"
            className="w-full max-w-lg object-contain drop-shadow-xl"
          />
          <div className="text-center space-y-2 max-w-md">
            <h3 className="text-2xl font-bold text-gray-800">
              Join Our Community
            </h3>
            <p className="text-gray-600">
              Connect with millions of students and transform your knowledge
              into a thriving business.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-2">
              Instructor Registration
            </h2>
            <p className="text-gray-500 text-sm">
              Create your account to start teaching on EduVerse
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
            autoComplete="off"
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="e.g. John Doe"
                className="bg-gray-50"
                maxLength={50}
                aria-invalid={!!errors.fullName}
                onBlur={() => handleTrimAndValidate("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className={`bg-gray-50 ${
                  errors.email ? "border-red-500 ring-1 ring-red-500" : ""
                }`}
                {...register("email")}
                aria-invalid={!!errors.email}
                onBlur={() => handleTrimAndValidate("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-gray-50 pr-10"
                  maxLength={50}
                  {...register("password")}
                  aria-invalid={!!errors.password}
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
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-gray-50 pr-10"
                  maxLength={50}
                  {...register("confirmPassword")}
                  aria-invalid={!!errors.confirmPassword}
                  onBlur={() => trigger("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="jobTitle"
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        trigger("jobTitle");
                      }}
                      value={field.value}
                    >
                      <SelectTrigger
                        className="bg-gray-50"
                        aria-invalid={!!errors.jobTitle}
                      >
                        <SelectValue placeholder="Select job title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Instructor">Instructor</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.jobTitle && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Subjects <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="subjects"
                  render={({ field }) => (
                    <MultiSelectDropdown
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        trigger("subjects");
                      }}
                      options={SUBJECT_OPTIONS}
                    />
                  )}
                />
                {errors.subjects && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.subjects.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-gray-600 pt-2">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 font-semibold hover:underline"
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
