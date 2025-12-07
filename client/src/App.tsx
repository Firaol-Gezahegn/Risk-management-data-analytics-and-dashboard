import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2 } from "lucide-react";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import RiskRegister from "@/pages/risks";
import RiskForm from "@/pages/risk-form";
import FileUpload from "@/pages/upload";
import ExcelUpload from "@/pages/excel-upload";
import Admin from "@/pages/admin";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background">
            <div className="max-w-7xl mx-auto">
              <Switch>
                <Route path="/">
                  <ProtectedRoute component={Dashboard} />
                </Route>
                <Route path="/risks">
                  <ProtectedRoute component={RiskRegister} />
                </Route>
                <Route path="/risks/new">
                  <ProtectedRoute component={RiskForm} />
                </Route>
                <Route path="/risks/:id/edit">
                  <ProtectedRoute component={RiskForm} />
                </Route>
                <Route path="/risks/:id/details">
                  <ProtectedRoute component={RiskForm} />
                </Route>
                <Route path="/upload">
                  <ProtectedRoute component={ExcelUpload} />
                </Route>
                <Route path="/excel-import">
                  <ProtectedRoute component={ExcelUpload} />
                </Route>
                <Route path="/reports">
                  <ProtectedRoute component={Reports} />
                </Route>
                <Route path="/admin">
                  <ProtectedRoute component={Admin} />
                </Route>
                <Route>
                  <NotFound />
                </Route>
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
