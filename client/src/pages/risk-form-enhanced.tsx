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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertRiskRecordSchema, type RiskRecord } from "@shared/schema";
import { Loader2, AlertCircle, Calculator } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";

// Enhanced schema with all new fields
const enhancedRiskSchema = insertRiskRecordSchema.extend({
  riskTitle: z.string().min(1, "Risk title is required"),
  objectives: z.string().optional(),
  processKeyActivity: z.string().optional(),
  rootCauses: z.string().optional(),
  riskImpact: z.string().optional(),
  existingRiskControl: z.string().optional(),
  potentialRiskResponse: z.string().optional(),
  levelOfImpact: z.coerce.number().min(0).max(100),
  controlEffectivenessScore: z.coerce.number().min(0).max(100).optional(),
  justification: z.string().optional(),
});

export default function RiskFormEnhanced() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditMode = !!params.id;
  const [computedScores, setComputedScores] = useState<any>(null);

  const { data: existingRisk, isLoading: loadingRisk } = useQuery<RiskRecord>({
    queryKey: ["/api/risks", params.id],
    enabled: isEditMode,
  });

  const form = useForm({
    resolver: zodResolver(enhancedRiskSchema),
    defaultValues: {
      riskTitle: "",
      objectives: "",
      processKeyActivity: "",
      riskDescription: "",
      rootCauses: "",
      riskImpact: "",
      existingRiskControl: "",
      potentialRiskResponse: "",
      riskType: "",
      riskCategory: "",
      businessUnit: "",
      department: "",
      likelihood: 0,
      levelOfImpact: 0,
      impact: 0,
      controlEffectivenessScore: 0,
      justification: "",
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
        riskTitle: existingRisk.riskTitle || "",
        objectives: existingRisk.objectives || "",
        processKeyActivity: existingRisk.processKeyActivity || "",
        riskDescription: existingRisk.riskDescription || "",
        rootCauses: existingRisk.rootCauses || "",
        riskImpact: existingRisk.riskImpact || "",
        existingRiskControl: existingRisk.existingRiskControl || "",
        potentialRiskResponse: existingRisk.potentialRiskResponse || "",
        riskType: existingRisk.riskType,
        riskCategory: existingRisk.riskCategory,
        businessUnit: existingRisk.businessUnit,
        department: existingRisk.department,
        likelihood: Number(existingRisk.likelihood),
        levelOfImpact: Number(existingRisk.levelOfImpact || existingRisk.impact),
        impact: Number(existingRisk.impact),
        controlEffectivenessScore: Number(existingRisk.controlEffectivenessScore || 0),
        justification: existingRisk.justification || "",
        residualRisk: Number(existingRisk.residualRisk || 0),
        status: existingRisk.status as "Open" | "Mitigating" | "Closed",
        dateReported: existingRisk.dateReported,
        description: existingRisk.description || "",
        mitigationPlan: existingRisk.mitigationPlan || "",
      });
    }
  }, [existingRisk, form]);

  const likelihood = form.watch("likelihood");
  const levelOfImpact = form.watch("levelOfImpact");
  const controlEffectiveness = form.watch("controlEffectivenessScore");

  // Auto-compute scores when values change
  useEffect(() => {
    if (likelihood > 0 && levelOfImpact > 0) {
      apiRequest("POST", "/api/risks/compute-scores", {
        likelihood,
        impact: levelOfImpact,
        controlEffectiveness: controlEffectiveness || undefined,
      })
        .then(setComputedScores)
        .catch(console.error);
    }
  }, [likelihood, levelOfImpact, controlEffectiveness]);

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

  const getRiskColor = (rating: string) => {
    const colors: Record<string, string> = {
      "Very Low": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      "Low": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      "Medium": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      "High": "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      "Very High": "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    };
    return colors[rating] || "";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isEditMode ? "Edit Risk" : "Add New Risk"}</h1>
        <p className="text-muted-foreground mt-2">
          {isEditMode ? "Update risk information" : "Create a new risk record in the register"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Identification</CardTitle>
                  <CardDescription>Basic information about the identified risk</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="riskTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cybersecurity breach risk" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="riskType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Risk Type *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Credit Risk" {...field} />
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
                              <SelectTrigger>
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
                            <Input placeholder="e.g., Retail Banking" {...field} />
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
                            <Input placeholder="e.g., Information & IT Service" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="objectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objectives</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What are the objectives related to this risk?"
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="processKeyActivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Process / Key Activity</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the process or key activity affected"
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="riskDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the risk in detail..."
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rootCauses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Root Causes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What are the root causes of this risk?"
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="riskImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Impact</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the potential impact of this risk"
                            className="min-h-20"
                            {...field}
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
                              <SelectTrigger>
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
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment (5×5 Matrix)</CardTitle>
                  <CardDescription>Evaluate likelihood and impact using 0-100 scale</CardDescription>
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
                            />
                          </FormControl>
                          <FormDescription>Probability of occurrence (0-100)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="levelOfImpact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level of Impact *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0-100"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormDescription>Severity of consequences (0-100)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {computedScores && (
                    <Alert className="border-primary">
                      <Calculator className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Inherent Risk Score:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">
                                {computedScores.inherentRisk.score.toFixed(2)}
                              </span>
                              <Badge className={getRiskColor(computedScores.inherentRisk.rating)}>
                                {computedScores.inherentRisk.rating}
                              </Badge>
                            </div>
                          </div>
                          {computedScores.residualRisk && (
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Residual Risk Score:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">
                                  {computedScores.residualRisk.score.toFixed(2)}
                                </span>
                                <Badge className={getRiskColor(computedScores.residualRisk.rating)}>
                                  {computedScores.residualRisk.rating}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="controls" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Controls</CardTitle>
                  <CardDescription>Existing controls and their effectiveness</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="existingRiskControl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Existing Risk Control</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe existing controls in place..."
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="controlEffectivenessScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Control Effectiveness Score</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0-100"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormDescription>
                          How effective are the existing controls? (0-100)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="justification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Justification</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Justify the control effectiveness score..."
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="response" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Response</CardTitle>
                  <CardDescription>Mitigation strategies and action plans</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="potentialRiskResponse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potential Risk Response</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe potential response strategies..."
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mitigationPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mitigation Plan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the detailed mitigation plan..."
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/risks")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
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
