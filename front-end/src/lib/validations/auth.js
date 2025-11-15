import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerLearnerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters.")
      .max(100, "Full name must not exceed 100 characters."),
    email: z
      .string()
      .min(1, "Email is required.")
      .email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password must not exceed 100 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerInstructorSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters.")
      .max(100, "Full name must not exceed 100 characters."),
    email: z
      .string()
      .min(1, "Email is required.")
      .email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password must not exceed 100 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    // normalize single-string or array into array and then validate
    subjects: z.preprocess((val) => {
      if (typeof val === "string") return [val];
      return val;
    }, z.array(z.string()).min(1, "Please select at least 1 subject")),
    jobTitle: z.string().min(1, "Please select a job title"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
