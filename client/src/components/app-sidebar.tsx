import { LayoutDashboard, Shield, Upload, FileText, Users, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["admin", "risk_manager", "chief_office", "user"],
  },
  {
    title: "Risk Register",
    url: "/risks",
    icon: Shield,
    roles: ["admin", "risk_manager", "chief_office", "user"],
  },
  {
    title: "Excel Import",
    url: "/excel-import",
    icon: Upload,
    roles: ["admin", "risk_manager", "chief_office"],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
    roles: ["admin", "risk_manager", "chief_office", "user"],
  },
  {
    title: "Admin",
    url: "/admin",
    icon: Users,
    roles: ["admin"],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const filteredItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex flex-col items-center gap-3">
            <div className="mx-auto h-16 w-16 rounded-xl bg-primary flex items-center justify-center overflow-hidden">
              <img
                src="/favicon.png"
                alt="Awash Bank Logo"
                className="h-full w-full object-cover"
              />
              </div>
            <div>
            <h2 className="font-bold text-lg">Awash Bank</h2>
            <p className="text-xs text-muted-foreground">Risk Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(" ", "-")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <div className="px-3 py-2 bg-accent rounded-lg">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize mt-1">{user?.role?.replace("_", " ")}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
