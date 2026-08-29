// @ts-nocheck
"use client";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, MapPin, Building2, Briefcase, IndianRupee } from "lucide-react";

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

export function AssessmentForm({ onSubmitSuccess }: AssessmentFormProps) {
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
  });

  const category = form.watch("category");

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSubmitSuccess(values);
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md rounded-xl border-border/50">
      <CardHeader className="bg-muted/30 pb-6 border-b">
        <CardTitle className="text-2xl">Start Business Assessment</CardTitle>
        <CardDescription>
          Enter your local details and financial capabilities to generate a hyper-local business feasibility report.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Geography Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                <MapPin className="w-5 h-5" />
                <h3>Location Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Maharashtra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Pune" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="village"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village / Block</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Baramati" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Financials & Category */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                <Briefcase className="w-5 h-5" />
                <h3>Business & Capital</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="marginCapital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Margin Capital (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Your own investment</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposed Business Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dairy">Dairy Farming</SelectItem>
                          <SelectItem value="retail">Retail / Kirana</SelectItem>
                          <SelectItem value="textiles">Textiles / Tailoring</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {category !== 'dairy' && (
                <Alert className="bg-amber-50 border-amber-200">
                  <InfoIcon className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Limited Prototype Support</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    The GramVyapar AI prototype is currently optimized for Dairy Farming. Other categories may have limited or generalized data.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Dairy Specifics */}
            {category === 'dairy' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <Building2 className="w-5 h-5" />
                  <h3>Dairy Specifications</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="animalCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Planned Herd Size (Animals)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="milkYieldPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avg. Milk Yield (L/animal/day)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="milkPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price (₹/Litre)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="feedCostPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feed Cost (₹/animal/day)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner (0-1 yr)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (1-3 yrs)</SelectItem>
                            <SelectItem value="expert">Expert (3+ yrs)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-lg">
              Generate Feasibility Report
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
