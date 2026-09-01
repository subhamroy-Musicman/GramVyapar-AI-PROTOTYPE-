"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save } from "lucide-react";
import { AssessmentData } from "./schema";

interface Step1ProfileProps {
  onNext: () => void;
}

export function Step1Profile({ onNext }: Step1ProfileProps) {
  const form = useFormContext<AssessmentData>();

  const handleContinue = async () => {
    const fieldsToValidate: (keyof AssessmentData)[] = [
      "state", "district", "village", 
      "name", "occupation", "yearsLivestock", "farmingBackground",
      "marginCapital", "existingDebt", "businessIntent", "landAvailable"
    ];
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-wider text-text-secondary uppercase mb-3">Step 1 · Entrepreneur Profile</p>
        <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-3">Begin with your starting point.</h2>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
          A good dairy plan is shaped by the person, place and resources behind it. Tell us about your context in plain terms.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        
        {/* 01 PLACE */}
        <div className="p-6 md:p-8 border-b border-border-subtle">
          <div className="mb-6">
            <h3 className="text-lg font-serif text-text-primary mb-1">01 · Place</h3>
            <p className="text-sm text-text-secondary">Where will the business operate? Location helps us understand the practical conditions around your proposed unit.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="state" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-sm font-semibold text-text-primary">State *</FormLabel>
                <FormControl><Input className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700" placeholder="e.g. Maharashtra" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="district" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">District *</FormLabel>
                <FormControl><Input className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700" placeholder="e.g. Pune" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="village" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Village or town *</FormLabel>
                <FormControl><Input className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700" placeholder="e.g. Baramati" {...field} /></FormControl>
                <FormDescription className="text-[11px]">Use the place closest to your proposed dairy unit.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        {/* 02 EXPERIENCE */}
        <div className="p-6 md:p-8 border-b border-border-subtle bg-surface-subtle/30">
          <div className="mb-6">
            <h3 className="text-lg font-serif text-text-primary mb-1">02 · Experience</h3>
            <p className="text-sm text-text-secondary">Tell us about your working context. There is no right answer. This helps us keep later questions relevant.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Your name *</FormLabel>
                <FormControl><Input className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700" placeholder="Enter name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="occupation" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Current occupation *</FormLabel>
                <FormControl><Input className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700" placeholder="e.g. Farmer, Labourer, Shop Owner" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="yearsLivestock" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Years working with livestock</FormLabel>
                <FormControl><Input type="number" className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700 tabular-nums" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="farmingBackground" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Do you have a farming background?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        {/* 03 RESOURCES */}
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-lg font-serif text-text-primary mb-1">03 · Resources</h3>
            <p className="text-sm text-text-secondary">How are you thinking about the investment? We are mapping your starting position before calculating financing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField control={form.control} name="marginCapital" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Own capital available (₹) *</FormLabel>
                <FormControl><Input type="number" className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700 tabular-nums" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="existingDebt" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Existing monthly EMI / debt (₹)</FormLabel>
                <FormControl><Input type="number" className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700 tabular-nums" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="businessIntent" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Business intent</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700">
                      <SelectValue placeholder="Select intent" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="start">Start new unit</SelectItem>
                    <SelectItem value="expand">Expand existing unit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="landAvailable" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Land or shed available?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 bg-white border-border-subtle focus-visible:ring-brand-700">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center mt-8 gap-4 pb-12">
        <div className="flex items-center text-sm text-text-secondary">
          <Save className="w-4 h-4 mr-2 opacity-50" /> Keep for this session
        </div>
        <Button 
          type="button" 
          onClick={handleContinue}
          className="w-full md:w-auto h-12 bg-[#15803D] hover:bg-[#166534] text-white font-medium px-8 rounded-lg shadow-sm"
        >
          Continue to dairy plan <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
