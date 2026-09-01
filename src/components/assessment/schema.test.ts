/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, it, expect } from "vitest";
import { assessmentSchema } from "./schema";

describe("Assessment Schema Numeric Safety", () => {
  const getBaseData = () => ({
    state: "MH", district: "Pune", village: "Baramati",
    name: "Test", occupation: "Farmer", yearsLivestock: 5, farmingBackground: "yes",
    marginCapital: 50000, existingDebt: 0, businessIntent: "start", landAvailable: "yes",
    animalCount: 5, animalType: "cow", animalPurchaseCost: 60000,
    milkYieldPerDay: 15, milkPrice: 40, lactationDays: 300,
    feedCostPerDay: 150, veterinaryAnnual: 5000, labourMonthly: 0, utilitiesMonthly: 500,
    insuranceAnnual: 3000, transportMonthly: 1000, otherOperatingAnnual: 2000,
    shedCost: 50000, equipmentCost: 20000, workingCapital: 30000, otherSetupCost: 5000
  });

  it("valid normal dairy-plan object -> accepted", () => {
    const data = getBaseData();
    expect(assessmentSchema.safeParse(data).success).toBe(true);
  });

  it("empty required numeric field (animalPurchaseCost) -> rejected", () => {
    const data = getBaseData();
    // @ts-expect-error test override testing empty string
    data.animalPurchaseCost = "";
    expect(assessmentSchema.safeParse(data).success).toBe(false);
  });

  it("Infinity -> rejected", () => {
    const data = getBaseData();
    // @ts-expect-error test override
    data.animalPurchaseCost = "Infinity";
    expect(assessmentSchema.safeParse(data).success).toBe(false);
  });

  it("-Infinity -> rejected", () => {
    const data = getBaseData();
    // @ts-expect-error test override
    data.feedCostPerDay = "-Infinity";
    expect(assessmentSchema.safeParse(data).success).toBe(false);
  });

  it("NaN -> rejected", () => {
    const data = getBaseData();
    // @ts-expect-error test override
    data.animalCount = "NaN";
    expect(assessmentSchema.safeParse(data).success).toBe(false);
  });

  it("negative financial value -> rejected", () => {
    const data = getBaseData();
    data.feedCostPerDay = -100;
    expect(assessmentSchema.safeParse(data).success).toBe(false);
  });

  it("animalCount 1.5 -> rejected", () => {
    const data = getBaseData();
    data.animalCount = 1.5;
    expect(assessmentSchema.safeParse(data).success).toBe(false);
  });

  it("animalCount 0 -> rejected", () => {
    const data = getBaseData();
    data.animalCount = 0;
    expect(assessmentSchema.safeParse(data).success).toBe(false);
  });

  it("lactationDays 366 -> rejected", () => {
    const data = getBaseData();
    data.lactationDays = 366;
    expect(assessmentSchema.safeParse(data).success).toBe(false);
  });

  it("valid zero optional cost -> accepted", () => {
    const data = getBaseData();
    // feedCostPerDay can be 0 theoretically if free grazing
    data.feedCostPerDay = 0;
    // equipmentCost 0 if no equipment needed
    data.equipmentCost = 0;
    expect(assessmentSchema.safeParse(data).success).toBe(true);
  });
});

