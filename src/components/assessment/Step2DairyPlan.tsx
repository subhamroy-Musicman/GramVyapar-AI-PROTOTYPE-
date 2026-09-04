/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { AssessmentData } from "./schema";

interface Step2DairyPlanProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step2DairyPlan({ onNext, onBack }: Step2DairyPlanProps) {
  const form = useFormContext<AssessmentData>();

  const handleContinue = async () => {
    const fieldsToValidate: (keyof AssessmentData)[] = [
      "animalCount", "animalType", "animalPurchaseCost",
      "milkYieldPerDay", "milkPrice", "lactationDays",
      "feedCostPerDay", "veterinaryAnnual", "labourMonthly", "utilitiesMonthly",
      "insuranceAnnual", "transportMonthly", "otherOperatingAnnual",
      "shedCost", "equipmentCost", "workingCapital", "otherSetupCost"
    ];
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      onNext();
    }
  };

  const CurrencyInput = ({ field, placeholder }: { field: any, placeholder?: string }) => (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">₹</span>
      <Input type="number" className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700 tabular-nums pl-7" placeholder={placeholder} {...field} />
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-wider text-text-secondary uppercase mb-3">Step 2 · Dairy Plan</p>
        <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-3">Dairy Plan</h2>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
          Proposed unit economics and operating assumptions.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        
        {/* 01 HERD */}
        <div className="p-6 md:p-8 border-b border-border-subtle">
          <div className="mb-6">
            <h3 className="text-lg font-serif text-text-primary mb-1">01 · Herd</h3>
            <p className="text-sm text-text-secondary">Size and type of herd.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="animalCount" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Number of animals *</FormLabel>
                <FormControl><Input type="number" className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700 tabular-nums" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="animalType" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Animal type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cow">Cow</SelectItem>
                    <SelectItem value="buffalo">Buffalo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="animalPurchaseCost" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-sm font-semibold text-text-primary">Purchase cost per animal *</FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormDescription className="text-[11px]">Use your expected purchase cost per animal. This is treated as a user input, not a live market price.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        {/* 02 PRODUCTION */}
        <div className="p-6 md:p-8 border-b border-border-subtle bg-surface-subtle/30">
          <div className="mb-6">
            <h3 className="text-lg font-serif text-text-primary mb-1">02 · Production</h3>
            <p className="text-sm text-text-secondary">What production do you expect? These values help estimate annual milk output and revenue.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="milkYieldPerDay" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Expected milk yield per animal *</FormLabel>
                <div className="relative">
                  <Input type="number" className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700 tabular-nums pr-20" {...field} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs font-medium bg-surface-subtle px-1.5 py-0.5 rounded border border-border-subtle">L / day</span>
                </div>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="milkPrice" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Milk selling price *</FormLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">₹</span>
                  <Input type="number" className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700 tabular-nums pl-7 pr-16" {...field} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs font-medium bg-surface-subtle px-1.5 py-0.5 rounded border border-border-subtle">/ L</span>
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="lactationDays" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Lactation days per year *</FormLabel>
                <div className="relative">
                  <Input type="number" className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700 tabular-nums pr-16" {...field} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs font-medium bg-surface-subtle px-1.5 py-0.5 rounded border border-border-subtle">days</span>
                </div>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <p className="text-[11px] text-text-secondary mt-5 italic">These values are entrepreneur assumptions unless a live verified data source is added later.</p>
        </div>

        {/* 03 OPERATING COSTS */}
        <div className="p-6 md:p-8 border-b border-border-subtle">
          <div className="mb-6 flex justify-between items-start gap-4">
            <div>
              <h3 className="text-lg font-serif text-text-primary mb-1">03 · Operating Costs</h3>
              <p className="text-sm text-text-secondary">Recurring operational costs.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="feedCostPerDay" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary flex justify-between">
                  <span>Feed cost per animal *</span>
                  <span className="text-[10px] text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded uppercase tracking-wide">Daily</span>
                </FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="veterinaryAnnual" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary flex justify-between">
                  <span>Veterinary cost *</span>
                  <span className="text-[10px] text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded uppercase tracking-wide">Annual</span>
                </FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="labourMonthly" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary flex justify-between">
                  <span>Labour cost</span>
                  <span className="text-[10px] text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded uppercase tracking-wide">Monthly</span>
                </FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="utilitiesMonthly" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary flex justify-between">
                  <span>Utilities (Electricity, Water)</span>
                  <span className="text-[10px] text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded uppercase tracking-wide">Monthly</span>
                </FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="insuranceAnnual" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary flex justify-between">
                  <span>Insurance</span>
                  <span className="text-[10px] text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded uppercase tracking-wide">Annual</span>
                </FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="transportMonthly" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary flex justify-between">
                  <span>Transport</span>
                  <span className="text-[10px] text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded uppercase tracking-wide">Monthly</span>
                </FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="otherOperatingAnnual" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-sm font-semibold text-text-primary flex justify-between">
                  <span>Other operating expenses</span>
                  <span className="text-[10px] text-text-secondary bg-surface-subtle px-1.5 py-0.5 rounded uppercase tracking-wide">Annual</span>
                </FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        {/* 04 SETUP & WORKING CAPITAL */}
        <div className="p-6 md:p-8 bg-surface-subtle/30">
          <div className="mb-6">
            <h3 className="text-lg font-serif text-text-primary mb-1">04 · Setup & Working Capital</h3>
            <p className="text-sm text-text-secondary">Setup and initial capital requirements.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="shedCost" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Shed / infrastructure cost</FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="equipmentCost" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Equipment cost</FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="workingCapital" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Initial working capital</FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="otherSetupCost" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Other setup cost</FormLabel>
                <FormControl><CurrencyInput field={field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <p className="text-[11px] text-text-secondary mt-5">These values will be combined with animal purchase cost to calculate total project cost.</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center mt-8 gap-4 pb-12">
        <Button 
          type="button" 
          variant="ghost"
          onClick={onBack}
          className="w-full md:w-auto h-12 text-text-secondary hover:text-text-primary font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to profile
        </Button>
        <Button 
          type="button" 
          onClick={handleContinue}
          className="w-full md:w-auto h-12 bg-[#15803D] hover:bg-[#166534] text-white font-medium px-8 rounded-lg shadow-sm"
        >
          Continue to analysis <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

