import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required.")
        .email({ message: "Please enter a valid email address." }),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .refine((s) => s.trim().length > 0, {
            message: "Password cannot be only whitespace",
        }),
});

export const registerLearnerSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(2, "Full name must be at least 2 characters.")
            .max(50, "Full name must not exceed 50 characters."),
        email: z
            .string()
            .trim()
            .min(1, "Email is required.")
            .email({ message: "Please enter a valid email address." }),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters.")
            .max(50, "Password must not exceed 50 characters.")
            .refine((s) => s.trim().length > 0, {
                message: "Password cannot be only whitespace",
            }),
        confirmPassword: z
            .string()
            .min(1, "Please confirm your password.")
            .refine((s) => s.trim().length > 0, {
                message: "Confirm password cannot be only whitespace",
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
            .trim()
            .min(2, "Full name must be at least 2 characters.")
            .max(50, "Full name must not exceed 50 characters."),
        email: z
            .string()
            .trim()
            .min(1, "Email is required.")
            .email({ message: "Please enter a valid email address." }),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters.")
            .max(50, "Password must not exceed 50 characters.")
            .refine((s) => s.trim().length > 0, {
                message: "Password cannot be only whitespace",
            }),
        confirmPassword: z
            .string()
            .min(1, "Please confirm your password.")
            .refine((s) => s.trim().length > 0, {
                message: "Confirm password cannot be only whitespace",
            }),
        // subjects: z
        //   .array(z.string().trim().min(1, "Subject cannot be empty"))
        //   .min(1, "Please select at least 1 subject"),
        // jobTitle: z.string().trim().min(1, "Please select a job title"),
        agreeTerms: z.boolean().refine((v) => v === true, {
            message: "You must agree to the terms and conditions",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
