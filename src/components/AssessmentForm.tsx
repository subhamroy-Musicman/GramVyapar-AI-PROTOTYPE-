/* eslint-disable @typescript-eslint/ban-ts-comment, react-hooks/incompatible-library */
// @ts-nocheck
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, ArrowLeft, CheckCircle2, Factory, Store, Scissors } from "lucide-react";

export const formSchema = z.object({
  state: z.string().min(1, { message: "State is required" }),
  district: z.string().min(1, { message: "District is required" }),
  village: z.string().min(1, { message: "Village/Block is required" }),
  marginCapital: z.coerce.number().min(10000, { message: "Minimum margin capital is ₹10,000" }),
  category: z.string().min(1, { message: "Category is required" }),
  animalCount: z.coerce.number().min(1, { message: "Must be at least 1" }),
  milkYieldPerDay: z.coerce.number().min(1, { message: "Must be at least 1" }),
  milkPrice: z.coerce.number().min(1, { message: "Must be at least 1" }),
  feedCostPerDay: z.coerce.number().min(1, { message: "Must be at least 1" }),
  experienceLevel: z.string().min(1, { message: "Experience is required" }),
});

interface AssessmentFormProps {
  onSubmitSuccess: (data: z.infer<typeof formSchema>) => void;
}

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTranslation } from "@/lib/i18n/translations";

export function AssessmentForm({ onSubmitSuccess }: AssessmentFormProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [step, setStep] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: "Maharashtra",
      district: "Pune",
      village: "Baramati",
      marginCapital: 100000,
      category: "dairy",
      animalCount: 5,
      milkYieldPerDay: 12,
      milkPrice: 45,
      feedCostPerDay: 150,
      experienceLevel: "intermediate",
    },
    mode: "onTouched",
  });

  const category = form.watch("category");

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (step === 1) fieldsToValidate = ["state", "district", "village"];
    if (step === 2) fieldsToValidate = ["marginCapital", "category"];
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSubmitSuccess(values);
  }

  const steps = [
    { id: 1, title: "Location" },
    { id: 2, title: "Capital & Business" },
    { id: 3, title: "Dairy Details" },
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-sm shadow-black/5 rounded-xl border-border-subtle bg-surface-main">
      <CardHeader className="border-b border-border-subtle/50 pb-4 md:pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold text-text-primary">Business Assessment</CardTitle>
            <CardDescription className="text-text-secondary mt-1 md:hidden">
              Step {step} of 3
            </CardDescription>
          </div>
          
          {/* Desktop Stepper */}
          <div className="hidden md:flex items-center gap-2">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  step === s.id ? 'bg-brand-700 text-white' :
                  step > s.id ? 'bg-brand-100 text-brand-900' : 'bg-surface-subtle text-text-secondary'
                }`}>
                  {step > s.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.id}
                </div>
                <span className={`ml-2 text-sm font-medium ${step === s.id ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {s.title}
                </span>
                {idx < steps.length - 1 && <div className="w-6 h-px bg-border-subtle mx-2" />}
              </div>
            ))}
          </div>

          {/* Mobile Stepper */}
          <div className="flex md:hidden gap-1 mt-2">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-brand-700' : 'bg-surface-subtle'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-brand-700' : 'bg-surface-subtle'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-brand-700' : 'bg-surface-subtle'}`} />
          </div>
        </div>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6 pb-2 transition-all duration-300 ease-in-out">
            {/* STEP 1: Location */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-2 hidden md:flex">
                  <MapPin className="w-5 h-5 text-brand-700" />
                  <h3 className="text-lg font-medium text-text-primary">Where are you operating?</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-text-secondary">State</FormLabel>
                        <FormControl>
                          <Input className="focus-visible:ring-brand-700 hover:border-text-secondary/30 h-11 text-base bg-white border-border-subtle text-text-primary" placeholder="e.g. Maharashtra" {...field} />
                        </FormControl>
                        <FormMessage className="text-danger-main" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">District</FormLabel>
                        <FormControl>
                          <Input className="focus-visible:ring-brand-700 hover:border-text-secondary/30 h-11 text-base bg-white border-border-subtle text-text-primary" placeholder="e.g. Pune" {...field} />
                        </FormControl>
                        <FormMessage className="text-danger-main" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Village / Block</FormLabel>
                        <FormControl>
                          <Input className="focus-visible:ring-brand-700 hover:border-text-secondary/30 h-11 text-base bg-white border-border-subtle text-text-primary" placeholder="e.g. Baramati" {...field} />
                        </FormControl>
                        <FormMessage className="text-danger-main" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Capital & Business */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                
                <FormField
                  control={form.control}
                  name="marginCapital"
                  render={({ field }) => (
                    <FormItem className="bg-surface-subtle p-5 rounded-lg border border-border-subtle">
                      <FormLabel className="text-text-primary text-base font-semibold">Available Margin Capital (₹)</FormLabel>
                      <FormDescription className="text-text-secondary mb-2">Your own initial investment amount before loans.</FormDescription>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">₹</span>
                          <Input 
                            className="focus-visible:ring-brand-700 hover:border-text-secondary/30 tabular-nums h-14 pl-8 text-xl md:text-2xl font-bold text-text-primary bg-white border-border-subtle" 
                            type="number" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-danger-main" />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel className="text-text-primary text-base font-semibold">Proposed Business Category</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => form.setValue("category", "dairy")}
                      className={`flex flex-col items-start p-4 border rounded-xl transition-all text-left h-full ${
                        category === 'dairy' ? 'border-brand-700 bg-brand-50 ring-1 ring-brand-700' : 'border-border-subtle hover:border-text-secondary/30 bg-surface-main'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <Factory className={`w-5 h-5 ${category === 'dairy' ? 'text-brand-900' : 'text-text-secondary'}`} />
                        {category === 'dairy' && <CheckCircle2 className="w-5 h-5 text-brand-700" />}
                      </div>
                      <span className="font-semibold text-text-primary">Dairy Farming</span>
                      <Badge variant="outline" className="mt-2 text-[10px] bg-brand-100 text-brand-900 border-brand-100">Prototype Ready</Badge>
                    </button>

                    <button
                      type="button"
                      onClick={() => form.setValue("category", "retail")}
                      className={`flex flex-col items-start p-4 border rounded-xl transition-all text-left h-full opacity-70 ${
                        category === 'retail' ? 'border-warning-main bg-warning-surface ring-1 ring-warning-main' : 'border-border-subtle hover:border-text-secondary/30 bg-surface-main'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <Store className={`w-5 h-5 ${category === 'retail' ? 'text-warning-main' : 'text-text-secondary'}`} />
                        {category === 'retail' && <CheckCircle2 className="w-5 h-5 text-warning-main" />}
                      </div>
                      <span className="font-semibold text-text-primary">Retail / Kirana</span>
                      <Badge variant="outline" className="mt-2 text-[10px] text-text-secondary border-border-subtle bg-surface-subtle">Limited Support</Badge>
                    </button>

                    <button
                      type="button"
                      onClick={() => form.setValue("category", "textiles")}
                      className={`flex flex-col items-start p-4 border rounded-xl transition-all text-left h-full opacity-70 ${
                        category === 'textiles' ? 'border-warning-main bg-warning-surface ring-1 ring-warning-main' : 'border-border-subtle hover:border-text-secondary/30 bg-surface-main'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <Scissors className={`w-5 h-5 ${category === 'textiles' ? 'text-warning-main' : 'text-text-secondary'}`} />
                        {category === 'textiles' && <CheckCircle2 className="w-5 h-5 text-warning-main" />}
                      </div>
                      <span className="font-semibold text-text-primary">Textiles</span>
                      <Badge variant="outline" className="mt-2 text-[10px] text-text-secondary border-border-subtle bg-surface-subtle">Limited Support</Badge>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Dairy Details */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* HERD */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2">Herd</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="animalCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-secondary">Herd Size (Total Animals)</FormLabel>
                          <FormControl>
                            <Input className="focus-visible:ring-brand-700 hover:border-text-secondary/30 bg-white border-border-subtle text-text-primary tabular-nums h-11" type="number" {...field} />
                          </FormControl>
                          <FormMessage className="text-danger-main" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-secondary">Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="focus-visible:ring-brand-700 hover:border-text-secondary/30 bg-white border-border-subtle text-text-primary h-11">
                                <SelectValue placeholder="Select experience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner (0-1 yr)</SelectItem>
                              <SelectItem value="intermediate">Intermediate (1-3 yrs)</SelectItem>
                              <SelectItem value="expert">Expert (3+ yrs)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-danger-main" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* PRODUCTION */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2">Production</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="milkYieldPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-secondary">Avg. Yield (L/animal/day)</FormLabel>
                          <FormControl>
                            <Input className="focus-visible:ring-brand-700 hover:border-text-secondary/30 bg-white border-border-subtle text-text-primary tabular-nums h-11" type="number" {...field} />
                          </FormControl>
                          <FormMessage className="text-danger-main" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="milkPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-secondary">Selling Price (₹/Litre)</FormLabel>
                          <FormControl>
                            <Input className="focus-visible:ring-brand-700 hover:border-text-secondary/30 bg-white border-border-subtle text-text-primary tabular-nums h-11" type="number" {...field} />
                          </FormControl>
                          <FormMessage className="text-danger-main" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* OPERATING COST */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2">Operating Cost</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="feedCostPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-text-secondary">Feed Cost (₹/animal/day)</FormLabel>
                          <FormControl>
                            <Input className="focus-visible:ring-brand-700 hover:border-text-secondary/30 bg-white border-border-subtle text-text-primary tabular-nums h-11" type="number" {...field} />
                          </FormControl>
                          <FormMessage className="text-danger-main" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col-reverse md:flex-row md:justify-between border-t border-border-subtle/50 pt-5 mt-2 gap-3 md:gap-0">
            {step > 1 ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack}
                className="w-full md:w-auto h-12 text-text-secondary border-border-subtle hover:bg-surface-subtle font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div className="hidden md:block" /> 
            )}
            
            {step < 3 ? (
              <Button 
                type="button" 
                onClick={handleNext}
                className="w-full md:w-auto h-12 bg-brand-700 hover:bg-brand-hover text-white font-medium px-8 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit"
                className="w-full md:w-auto h-12 bg-brand-700 hover:bg-brand-hover text-white shadow-sm font-medium px-8 transition-colors"
              >
                {t("Generate Assessment")}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
