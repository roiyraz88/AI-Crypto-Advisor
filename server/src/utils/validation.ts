import { z } from "zod";


export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(1, "Name is required"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

// Preferences schema
export const preferencesSchema = z.object({
  body: z.object({
    experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
    riskTolerance: z.enum(["low", "moderate", "high"]),
    investmentGoals: z.array(z.string()).min(1, "At least one investment goal is required"),
    favoriteCryptos: z.array(z.string()).min(1, "At least one favorite crypto is required"),
    contentTypes: z.array(z.string()).optional(),
  }),
});

// Vote schema
export const voteSchema = z.object({
  body: z.object({
    contentId: z.string().min(1, "Content ID is required"),
    vote: z.enum(["up", "down"]),
  }),
});

