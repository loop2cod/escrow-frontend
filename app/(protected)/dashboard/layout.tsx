"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/lib/types";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Bell, Search, Sun, ChevronDown, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store/auth-store";

function UserNav() {
  const { user } = useAuthStore();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center gap-2 h-9  hover:bg-accent rounded-full ring-0 p-0 focus-visible:ring-0"
        >
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium rounded-full">
              {user?.username ? getInitials(user.username) : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline text-sm font-medium">
            {user?.username || "User"}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground mr-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TopNav() {
  return (
    <div className="flex items-center justify-end rounded-xl bg-card px-4 py-3 mx-3 mt-3">
      {/* <div className="flex items-center gap-4 flex-1">
        <div className="relative hidden md:block max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-9 w-full rounded-full bg-muted/50 pl-10 pr-12 border-0 focus-visible:ring-1"
          />
        </div>
      </div> */}

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Sun className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* User Nav */}
        <UserNav />
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.USER]}>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          {/* Left Sidebar */}
          <AppSidebar />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Top Navigation - Lifted and separate */}
            <TopNav />

            {/* Page Content */}
            <main className="flex-1 overflow-auto p-3">
              <div className="rounded-xl bg-card min-h-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
