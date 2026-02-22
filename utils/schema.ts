import { z } from "zod";

// --- AUTH ---
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Phone number must be 10 or 11 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
terms: z.boolean().refine(val => val === true, {
  message: "You must agree to the terms",
}),
});

// --- MENU MANAGEMENT ---
export const menuItemSchema = z.object({
  name: z.string().min(2, "Dish name is too short"),
  description: z.string().optional(),
  price: z.coerce.number().min(100, "Price must be at least ₦100"),
  categoryName: z.string().min(2, "Category is required (e.g., Rice, Drinks)"),
  imageUri: z.string().nullable().refine((val) => val !== null, "Please upload a dish image"),
});

// --- WALLET / PAYOUTS ---
// Dynamic schema to check against current wallet balance
export const createPayoutSchema = (availableBalance: number) => 
  z.object({
    amount: z.coerce.number()
      .min(1000, "Minimum withdrawal is ₦1,000")
      .max(availableBalance, "Insufficient funds"),
    
    bankName: z.string().min(2, "Enter a valid bank name"),
    accountNumber: z.string().regex(/^[0-9]{10}$/, "Account number must be 10 digits"),
    accountName: z.string().min(2, "Enter account holder name"),
  });

// Types
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;