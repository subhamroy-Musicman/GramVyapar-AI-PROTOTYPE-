import * as z from "zod";

export const assessmentSchema = z.object({
  // Step 1: Profile
  state: z.string().min(1, { message: "State is required" }),
  district: z.string().min(1, { message: "District is required" }),
  village: z.string().min(1, { message: "Village/Block is required" }),
  
  name: z.string().min(1, { message: "Name is required" }),
  occupation: z.string().min(1, { message: "Occupation is required" }),
  yearsLivestock: z.coerce.number().finite().min(0, { message: "Must be a valid number" }),
  farmingBackground: z.enum(["yes", "no"]),
  
  marginCapital: z.coerce.number().finite().min(10000, { message: "Minimum margin capital is ₹10,000" }),
  existingDebt: z.coerce.number().finite().min(0).default(0),
  businessIntent: z.enum(["start", "expand"]),
  landAvailable: z.enum(["yes", "no"]),

  // Step 2: Dairy Plan (Herd)
  animalCount: z.coerce.number().finite().int().min(1, { message: "Must have at least 1 animal" }),
  animalType: z.enum(["cow", "buffalo"]),
  animalPurchaseCost: z.coerce.number().finite().positive({ message: "Must be greater than 0" }),

  // Step 2: Production
  milkYieldPerDay: z.coerce.number().finite().positive({ message: "Must be greater than 0" }),
  milkPrice: z.coerce.number().finite().positive({ message: "Must be greater than 0" }),
  lactationDays: z.coerce.number().finite().int().min(1).max(365, { message: "Must be between 1 and 365" }),

  // Step 2: Operating Costs
  feedCostPerDay: z.coerce.number().finite().min(0),
  veterinaryAnnual: z.coerce.number().finite().min(0),
  labourMonthly: z.coerce.number().finite().min(0),
  utilitiesMonthly: z.coerce.number().finite().min(0),
  insuranceAnnual: z.coerce.number().finite().min(0),
  transportMonthly: z.coerce.number().finite().min(0),
  otherOperatingAnnual: z.coerce.number().finite().min(0),

  // Step 2: Setup & Working Capital
  shedCost: z.coerce.number().finite().min(0),
  equipmentCost: z.coerce.number().finite().min(0),
  workingCapital: z.coerce.number().finite().min(0),
  otherSetupCost: z.coerce.number().finite().min(0),

  // Hidden/Legacy compatibility where needed
  category: z.string().default("dairy"),
  experienceLevel: z.string().default("intermediate"),
});

export type AssessmentData = z.infer<typeof assessmentSchema>;
