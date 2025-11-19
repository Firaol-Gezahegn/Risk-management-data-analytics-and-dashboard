import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { IngestionStaging } from "@shared/schema";
import * as XLSX from "xlsx";
import Papa from "papaparse";

export default function FileUpload() {
  const { toast } = useToast();
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: stagingData, isLoading: loadingStaging } = useQuery<IngestionStaging[]>({
    queryKey: ["/api/ingest/staging"],
  });

  const uploadMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/ingest/upload", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingest/staging"] });
      toast({
        title: "Upload successful",
        description: "File has been uploaded and staged for review.",
      });
      setUploadedData([]);
      setFileName("");
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload file data.",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/ingest/approve", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingest/staging"] });
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/risks/statistics"] });
      toast({
        title: "Data approved",
        description: "Staging data has been approved and moved to risk register.",
      });
    },
    onError: () => {
      toast({
        title: "Approval failed",
        description: "Failed to approve staging data.",
        variant: "destructive",
      });
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/ingest/staging", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingest/staging"] });
      toast({
        title: "Staging cleared",
        description: "All staging data has been removed.",
      });
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const data = await file.arrayBuffer();
      let parsedData: any[] = [];

      if (file.name.endsWith(".csv")) {
        const text = new TextDecoder().decode(data);
        const result = Papa.parse(text, { header: true });
        parsedData = result.data;
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(firstSheet);
      }

      setUploadedData(parsedData.filter((row) => Object.values(row).some((val) => val)));
      toast({
        title: "File parsed",
        description: `Successfully parsed ${parsedData.length} rows.`,
      });
    } catch (error) {
      toast({
        title: "Parse error",
        description: "Failed to parse file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
  });

  const handleUpload = () => {
    if (uploadedData.length === 0) return;
    uploadMutation.mutate({
      sourceFile: fileName,
      data: uploadedData,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">File Upload</h1>
        <p className="text-muted-foreground mt-2">Import risk data from CSV or Excel files</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>Drag and drop a CSV or Excel file to import risk data</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
            }`}
            data-testid="dropzone-upload"
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              {isProcessing ? (
                <>
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                  <p className="text-lg font-medium">Processing file...</p>
                </>
              ) : (
                <>
                  <Upload className="h-16 w-16 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive ? "Drop the file here" : "Drag & drop file here"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      or click to browse (CSV, XLS, XLSX)
                    </p>
                  </div>
                  {fileName && (
                    <Badge variant="secondary" className="mt-2">
                      <FileSpreadsheet className="h-3 w-3 mr-1" />
                      {fileName}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>

          {uploadedData.length > 0 && (
            <div className="mt-6 space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Preview shows {uploadedData.length} rows. Review and upload to staging.
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(uploadedData[0] || {}).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedData.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        {Object.values(row).map((val: any, i) => (
                          <TableCell key={i}>{String(val)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setUploadedData([])}>
                  Clear
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  data-testid="button-upload-staging"
                >
                  {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload to Staging
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staging Area</CardTitle>
              <CardDescription>
                Review uploaded data before approving to risk register
              </CardDescription>
            </div>
            {stagingData && stagingData.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                  data-testid="button-clear-staging"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  data-testid="button-approve-staging"
                >
                  {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingStaging ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !stagingData || stagingData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data in staging area. Upload a file to begin.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {stagingData.length} records pending approval
              </p>
              <div className="border rounded-lg max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Source File</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stagingData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.sourceFile}</TableCell>
                        <TableCell>
                          <Badge variant={item.errors ? "destructive" : "default"}>
                            {item.errors ? (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Has Errors
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Valid
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
