import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["LEARNER", "INSTRUCTOR"]),
});

export const learnerSchema = z.object({
  postcode: z.string().min(2, "Enter your area or postcode"),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "BOTH"]),
  goal: z.string().max(200).optional(),
});

export const instructorSchema = z.object({
  adiNumber: z.string().min(2, "Enter your ADI badge number"),
  businessName: z.string().max(120).optional(),
  postcodes: z.string().min(2, "Enter the areas you cover"),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "BOTH"]),
  hourlyRate: z.coerce.number().int().min(1, "Enter your hourly rate"),
  carDetails: z.string().max(120).optional(),
  bio: z.string().max(400).optional(),
});

// Editing an existing instructor profile — same as setup but without the ADI
// number (that's tied to verification and can't be changed here), plus the
// cancellation-notice setting.
export const instructorProfileSchema = z.object({
  businessName: z.string().max(120).optional(),
  postcodes: z.string().min(2, "Enter the areas you cover"),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "BOTH"]),
  hourlyRate: z.coerce.number().int().min(1, "Enter your hourly rate"),
  carDetails: z.string().max(120).optional(),
  bio: z.string().max(400).optional(),
  cancellationNoticeHours: z.coerce.number().int().min(0).max(168),
});
