import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Download, Edit, Trash2, Filter } from "lucide-react";
import type { RiskRecord } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DepartmentFilter } from "@/components/department-select";
import { RISK_CATEGORIES, RISK_STATUS } from "@shared/constants";

export default function RiskRegister() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: risksResponse, isLoading } = useQuery<{
    data: RiskRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: ["/api/risks"],
  });

  const risks = risksResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/risks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/risks/statistics"] });
      toast({
        title: "Risk deleted",
        description: "The risk record has been successfully deleted.",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete risk record.",
        variant: "destructive",
      });
    },
  });

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: "High", variant: "destructive" as const };
    if (score >= 40) return { label: "Medium", variant: "secondary" as const };
    return { label: "Low", variant: "default" as const };
  };

  const filteredRisks = risks.filter((risk) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      (risk.riskType && risk.riskType.toLowerCase().includes(searchText)) ||
      (risk.riskTitle && risk.riskTitle.toLowerCase().includes(searchText)) ||
      (risk.businessUnit && risk.businessUnit.toLowerCase().includes(searchText)) ||
      (risk.department && risk.department.toLowerCase().includes(searchText));
    const matchesStatus = statusFilter === "all" || risk.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || risk.riskCategory === categoryFilter;
    const matchesDepartment = departmentFilter === "all" || risk.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesDepartment;
  });

  const exportToCSV = () => {
    const headers = ["Risk ID", "Title", "Type", "Category", "Department", "Likelihood", "Impact", "Risk Score", "Status", "Date Reported"];
    const rows = filteredRisks.map((r) => [
      r.riskId || r.id,
      r.riskTitle || r.description || r.riskType,
      r.riskType,
      r.riskCategory,
      r.department,
      r.likelihood,
      r.impact || r.levelOfImpact,
      r.riskScore || r.inherentRisk,
      r.status,
      r.dateReported,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "risk-register.csv";
    a.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Risk Register</h1>
          <p className="text-muted-foreground mt-2">Manage and monitor all identified risks</p>
        </div>
        <Link href="/risks/new">
          <Button data-testid="button-add-risk">
            <Plus className="mr-2 h-4 w-4" />
            Add Risk
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>All Risks ({filteredRisks.length})</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search risks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
              <DepartmentFilter value={departmentFilter} onValueChange={setDepartmentFilter} />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.values(RISK_STATUS).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]" data-testid="select-category-filter">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {RISK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportToCSV} data-testid="button-export">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Likelihood</TableHead>
                  <TableHead className="text-right">Impact</TableHead>
                  <TableHead className="text-right">Inherent Risk</TableHead>
                  <TableHead className="text-right">Control Eff.</TableHead>
                  <TableHead className="text-right">Residual Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRisks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No risks found. Click "Add Risk" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRisks.map((risk) => {
                    const inherentScore = Number(risk.inherentRisk || 0);
                    const residualScore = Number(risk.residualRisk || 0);
                    const controlEff = Number(risk.controlEffectivenessScore || 0);
                    
                    const inherentLevel = getRiskLevel(inherentScore);
                    const residualLevel = getRiskLevel(residualScore);
                    
                    const displayTitle = risk.riskTitle || risk.description || risk.riskType || 'Untitled';
                    const displayId = risk.riskId || `#${risk.id}`;
                    const createdDate = new Date(risk.createdAt).toLocaleDateString();
                    
                    return (
                      <TableRow key={risk.id} data-testid={`row-risk-${risk.id}`}>
                        <TableCell className="font-medium">{displayId}</TableCell>
                        <TableCell className="max-w-xs truncate" title={displayTitle}>{displayTitle}</TableCell>
                        <TableCell>{risk.riskCategory}</TableCell>
                        <TableCell>{risk.department}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {risk.ownerId ? 'Assigned' : 'Unassigned'}
                        </TableCell>
                        <TableCell className="text-right">{Number(risk.likelihood).toFixed(0)}</TableCell>
                        <TableCell className="text-right">{Number(risk.impact || risk.levelOfImpact || 0).toFixed(0)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={inherentLevel.variant}>{inherentScore.toFixed(0)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {controlEff > 0 ? `${controlEff.toFixed(0)}%` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {residualScore > 0 ? (
                            <Badge variant={residualLevel.variant}>{residualScore.toFixed(0)}</Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{risk.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{createdDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/risks/${risk.id}/edit`}>
                              <Button variant="ghost" size="icon" data-testid={`button-edit-${risk.id}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(risk.id)}
                              data-testid={`button-delete-${risk.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the risk record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
