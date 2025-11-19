import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, TrendingUp, BarChart3 } from "lucide-react";

export default function Reports() {
  const handleExport = (type: string) => {
    console.log(`Exporting ${type} report`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-2">Generate and export risk management reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Risk Register Report</CardTitle>
                <CardDescription>Complete risk inventory</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export all risk records with current status, assessments, and ownership details.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleExport("register")}
              data-testid="button-export-register"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>Risk patterns over time</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Analyze risk identification and mitigation trends across periods.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleExport("trend")}
              data-testid="button-export-trend"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Category Analysis</CardTitle>
                <CardDescription>Risk breakdown by type</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Distribution and concentration analysis by risk category and business unit.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleExport("category")}
              data-testid="button-export-category"
            >
              <Download className="mr-2 h-4 w-4" />
              Export XLSX
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>Period performance report</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive monthly summary of risk activities, new identifications, and closures.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleExport("monthly")}
              data-testid="button-export-monthly"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Audit Report</CardTitle>
                <CardDescription>Compliance documentation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Audit trail and compliance report for regulatory requirements.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleExport("audit")}
              data-testid="button-export-audit"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle>Executive Dashboard</CardTitle>
                <CardDescription>High-level overview</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Executive summary with key metrics, trends, and actionable insights.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleExport("executive")}
              data-testid="button-export-executive"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>Configure automated report generation and delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Scheduled reporting feature coming soon</p>
            <p className="text-sm mt-2">Configure email delivery and report schedules</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
