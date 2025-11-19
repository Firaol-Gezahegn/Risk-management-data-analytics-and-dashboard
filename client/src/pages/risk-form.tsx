import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertRiskRecordSchema, type RiskRecord } from "@shared/schema";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RiskForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditMode = !!params.id;
  const [inherentRisk, setInherentRisk] = useState<number>(0);

  const { data: existingRisk, isLoading: loadingRisk } = useQuery<RiskRecord>({
    queryKey: ["/api/risks", params.id],
    enabled: isEditMode,
  });

  const form = useForm({
    resolver: zodResolver(insertRiskRecordSchema),
    defaultValues: {
      riskType: "",
      riskCategory: "",
      businessUnit: "",
      department: "",
      likelihood: 0,
      impact: 0,
      residualRisk: 0,
      status: "Open" as const,
      dateReported: new Date().toISOString().split("T")[0],
      description: "",
      mitigationPlan: "",
    },
  });

  useEffect(() => {
    if (existingRisk) {
      form.reset({
        riskType: existingRisk.riskType,
        riskCategory: existingRisk.riskCategory,
        businessUnit: existingRisk.businessUnit,
        department: existingRisk.department,
        likelihood: Number(existingRisk.likelihood),
        impact: Number(existingRisk.impact),
        residualRisk: Number(existingRisk.residualRisk || 0),
        status: existingRisk.status as "Open" | "Mitigating" | "Closed",
        dateReported: existingRisk.dateReported,
        description: existingRisk.description || "",
        mitigationPlan: existingRisk.mitigationPlan || "",
      });
    }
  }, [existingRisk, form]);

  const likelihood = form.watch("likelihood");
  const impact = form.watch("impact");

  useEffect(() => {
    const calculated = Number(likelihood) * Number(impact) / 100;
    setInherentRisk(calculated);
  }, [likelihood, impact]);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/risks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/risks/statistics"] });
      toast({
        title: "Risk created",
        description: "The risk record has been successfully created.",
      });
      setLocation("/risks");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create risk record.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/risks/${params.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/risks/statistics"] });
      toast({
        title: "Risk updated",
        description: "The risk record has been successfully updated.",
      });
      setLocation("/risks");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update risk record.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (loadingRisk) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: "High Risk", color: "text-red-600 dark:text-red-400" };
    if (score >= 40) return { label: "Medium Risk", color: "text-orange-600 dark:text-orange-400" };
    return { label: "Low Risk", color: "text-green-600 dark:text-green-400" };
  };

  const level = getRiskLevel(inherentRisk);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isEditMode ? "Edit Risk" : "Add New Risk"}</h1>
        <p className="text-muted-foreground mt-2">
          {isEditMode ? "Update risk information" : "Create a new risk record in the register"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Details</CardTitle>
              <CardDescription>Basic information about the identified risk</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="riskType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Type *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Credit Risk" {...field} data-testid="input-risk-type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Operational">Operational</SelectItem>
                          <SelectItem value="Financial">Financial</SelectItem>
                          <SelectItem value="Strategic">Strategic</SelectItem>
                          <SelectItem value="Compliance">Compliance</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Unit *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Retail Banking" {...field} data-testid="input-business-unit" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Lending" {...field} data-testid="input-department" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the risk in detail..."
                        className="min-h-24"
                        {...field}
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>Evaluate likelihood and impact (0-100 scale)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="likelihood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Likelihood *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0-100"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          data-testid="input-likelihood"
                        />
                      </FormControl>
                      <FormDescription>Probability of occurrence (0-100)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0-100"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          data-testid="input-impact"
                        />
                      </FormControl>
                      <FormDescription>Severity of consequences (0-100)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {(likelihood > 0 || impact > 0) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>Calculated Inherent Risk Score:</span>
                      <span className={`text-lg font-bold ${level.color}`} data-testid="text-inherent-risk">
                        {inherentRisk.toFixed(2)} ({level.label})
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="residualRisk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residual Risk</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="After mitigation"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        data-testid="input-residual-risk"
                      />
                    </FormControl>
                    <FormDescription>Expected risk level after controls are applied</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mitigation & Status</CardTitle>
              <CardDescription>Risk management and tracking information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="mitigationPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mitigation Plan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the mitigation strategy..."
                        className="min-h-24"
                        {...field}
                        data-testid="textarea-mitigation"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="Mitigating">Mitigating</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateReported"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Reported *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-date-reported" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/risks")}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? "Update Risk" : "Create Risk"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
