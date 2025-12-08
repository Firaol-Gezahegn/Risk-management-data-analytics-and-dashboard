import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

interface ValidationResult {
  success: boolean;
  imported: number;
  errors: ValidationError[];
  data: any[];
}

export default function ExcelUpload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateMutation = useMutation({
    mutationFn: (data: any[]) => apiRequest("POST", "/api/risks/import/validate", { data }) as unknown as Promise<ValidationResult>,
    onSuccess: (result: ValidationResult) => {
      setValidationResult(result);
      if (result.success) {
        toast({
          title: "Validation Successful",
          description: `${result.imported} risks ready to import`,
        });
      } else {
        toast({
          title: "Validation Errors",
          description: `Found ${result.errors.length} errors. Please fix them and try again.`,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Validation Failed",
        description: "Failed to validate Excel file",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: (data: any[]) => apiRequest("POST", "/api/risks/import/execute", { data }) as unknown as Promise<any>,
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/risks/statistics"] });
      toast({
        title: "Import Successful",
        description: `Successfully imported ${result.imported} risks`,
      });
      setFile(null);
      setValidationResult(null);
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Failed to import risks",
        variant: "destructive",
      });
    },
  });

  const handleDownloadTemplate = () => {
    // Generate template directly in frontend - no API call needed
    const template = [
      {
        'Risk Title': 'Example: Cybersecurity breach risk',
        'Risk Type': 'Operational',
        'Risk Category': 'Technology',
        'Business Unit': 'Information Technology',
        'Department': 'Information Technology',
        'Status': 'Open',
        'Date Reported': '2024-01-15',
        'Objectives': 'Protect customer data and maintain system integrity',
        'Process/Key Activity': 'Data storage and transmission processes',
        'Risk Description': 'Potential unauthorized access to sensitive customer data through system vulnerabilities',
        'Root Causes': 'Outdated security protocols, insufficient access controls, lack of regular security audits',
        'Risk Impact': 'Financial loss, regulatory penalties, reputational damage, customer trust erosion',
        'Existing Risk Control': 'Firewall, antivirus software, basic access controls',
        'Potential Risk Response': 'Implement multi-factor authentication, conduct regular penetration testing',
        'Likelihood': 80,
        'Impact': 90,
        'Control Effectiveness': 60,
        'Justification': 'High likelihood due to increasing cyber threats; high impact due to sensitive data',
        'Mitigation Plan': 'Phase 1: Security audit, Phase 2: Infrastructure upgrade, Phase 3: Staff training',
      },
      {
        'Risk Title': 'Example: Credit default risk',
        'Risk Type': 'Financial',
        'Risk Category': 'Credit',
        'Business Unit': 'Credit',
        'Department': 'Credit',
        'Status': 'Mitigating',
        'Date Reported': '2024-02-01',
        'Objectives': 'Maintain healthy loan portfolio and minimize non-performing loans',
        'Process/Key Activity': 'Credit assessment and loan approval process',
        'Risk Description': 'Risk of borrowers defaulting on loan obligations',
        'Root Causes': 'Economic downturn, inadequate credit assessment, insufficient collateral',
        'Risk Impact': 'Financial losses, increased provisions, reduced profitability',
        'Existing Risk Control': 'Credit scoring system, collateral requirements, regular monitoring',
        'Potential Risk Response': 'Enhanced due diligence, stricter lending criteria, diversification',
        'Likelihood': 50,
        'Impact': 70,
        'Control Effectiveness': 40,
        'Justification': 'Moderate likelihood based on economic indicators; significant impact on portfolio',
        'Mitigation Plan': 'Implement enhanced credit scoring model and increase monitoring frequency',
      },
      {
        'Risk Title': 'Example: Regulatory compliance violation',
        'Risk Type': 'Regulatory',
        'Risk Category': 'Compliance',
        'Business Unit': 'Compliance',
        'Department': 'Compliance',
        'Status': 'Monitoring',
        'Date Reported': '2024-03-10',
        'Objectives': 'Ensure full compliance with banking regulations and avoid penalties',
        'Process/Key Activity': 'Regulatory reporting and compliance monitoring',
        'Risk Description': 'Risk of non-compliance with AML/CFT regulations',
        'Root Causes': 'Complex regulatory environment, manual processes, staff knowledge gaps',
        'Risk Impact': 'Regulatory fines, license suspension, reputational damage',
        'Existing Risk Control': 'Compliance team, regular training, automated reporting tools',
        'Potential Risk Response': 'Implement compliance management system, increase training frequency',
        'Likelihood': 30,
        'Impact': 80,
        'Control Effectiveness': 70,
        'Justification': 'Low likelihood due to strong controls; high impact if violations occur',
        'Mitigation Plan': 'Quarterly compliance reviews and continuous staff training program',
      },
    ];

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Risk Template");

    // Set column widths for all fields
    ws['!cols'] = [
      { wch: 35 }, // Risk Title
      { wch: 15 }, // Risk Type
      { wch: 15 }, // Risk Category
      { wch: 25 }, // Business Unit
      { wch: 25 }, // Department
      { wch: 12 }, // Status
      { wch: 15 }, // Date Reported
      { wch: 40 }, // Objectives
      { wch: 35 }, // Process/Key Activity
      { wch: 50 }, // Risk Description
      { wch: 40 }, // Root Causes
      { wch: 40 }, // Risk Impact
      { wch: 40 }, // Existing Risk Control
      { wch: 40 }, // Potential Risk Response
      { wch: 12 }, // Likelihood
      { wch: 12 }, // Impact
      { wch: 18 }, // Control Effectiveness
      { wch: 40 }, // Justification
      { wch: 40 }, // Mitigation Plan
    ];

    // Download
    XLSX.writeFile(wb, "Risk_Import_Template.xlsx");

    toast({
      title: "Template Downloaded",
      description: "Excel template with 3 example rows has been downloaded",
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationResult(null);
    setIsValidating(true);

    try {
      // Read Excel file
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate
      validateMutation.mutate(jsonData);
    } catch (error) {
      toast({
        title: "File Read Error",
        description: "Failed to read Excel file",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = () => {
    if (validationResult && validationResult.success) {
      importMutation.mutate(validationResult.data);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Risk Import</h1>
        <p className="text-muted-foreground mt-2">
          Import multiple risks from Excel with validation and approval workflow
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Import Risks</CardTitle>
          <CardDescription>Follow these steps to import risks from Excel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <div>
                <div className="font-medium">Download Template</div>
                <div className="text-sm text-muted-foreground">
                  Download the Excel template with the correct column format
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <div>
                <div className="font-medium">Fill in Risk Data</div>
                <div className="text-sm text-muted-foreground">
                  Add your risk data following the template format. Required fields: Risk Title, Department, Likelihood, Impact
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <div>
                <div className="font-medium">Upload & Validate</div>
                <div className="text-sm text-muted-foreground">
                  Upload your file. The system will validate all data and show any errors
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                4
              </div>
              <div>
                <div className="font-medium">Import</div>
                <div className="text-sm text-muted-foreground">
                  If validation passes, click Import to add all risks to the system
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Valid Departments:</strong> Credit Management Office, Corporate Strategy, Digital Banking, 
              Facility Management, Finance Office, Human Capital, IFB, Information & IT Service, Internal Audit, 
              Legal Service, Marketing Office, Retail & SME, Risk & Compliance, Transformation Office, Trade Service, 
              Wholesale Banking
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Download Template */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Download Template</CardTitle>
          <CardDescription>Get the Excel template with example data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownloadTemplate} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download Excel Template
          </Button>
        </CardContent>
      </Card>

      {/* Upload File */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2 & 3: Upload & Validate</CardTitle>
          <CardDescription>Upload your filled Excel file for validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </span>
              </Button>
            </label>
            {file && (
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          {isValidating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Validating file...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              {validationResult.success
                ? "All data is valid and ready to import"
                : "Please fix the errors below"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult.success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Validation Successful!</div>
                  <div className="text-sm mt-1">
                    {validationResult.imported} risks are ready to be imported
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Found {validationResult.errors.length} Errors</div>
                  <div className="text-sm mt-1">Please fix these errors and upload again</div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error List */}
            {validationResult.errors.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <div className="font-medium text-sm">Errors:</div>
                {validationResult.errors.map((error, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-destructive/10 text-sm">
                    <div className="font-medium">
                      Row {error.row}, Field: {error.field}
                    </div>
                    <div className="text-muted-foreground">{error.message}</div>
                    {error.value !== null && error.value !== undefined && (
                      <div className="text-xs mt-1">Value: "{String(error.value)}"</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {validationResult && validationResult.success && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Import</CardTitle>
            <CardDescription>Import validated risks into the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleImport}
              disabled={importMutation.isPending}
              className="w-full sm:w-auto"
            >
              {importMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import {validationResult.imported} Risks
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
