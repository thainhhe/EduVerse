import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email({ message: "Please enter a valid email address." }),
  // align with backend minimum (6)
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerLearnerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters.") // align with backend username min
      .max(100, "Full name must not exceed 100 characters."),
    email: z
      .string()
      .min(1, "Email is required.")
      .email({ message: "Please enter a valid email address." }),
    // align with backend minimum (6)
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(100, "Password must not exceed 100 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    // optionally require agreeTerms
    agreeTerms: z.boolean().refine((v) => v === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerInstructorSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name must not exceed 100 characters."),
    email: z
      .string()
      .min(1, "Email is required.")
      .email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(100, "Password must not exceed 100 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    subjects: z.preprocess((val) => {
      if (typeof val === "string") return [val];
      return val;
    }, z.array(z.string()).min(1, "Please select at least 1 subject")),
    jobTitle: z.string().optional(),
    agreeTerms: z.boolean().refine((v) => v === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
