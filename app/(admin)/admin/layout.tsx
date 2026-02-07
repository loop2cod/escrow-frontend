"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/lib/types";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebarComponent } from "@/components/admin/admin-sidebar";
import { Bell, Search, Sun, ChevronDown, Menu, Shield } from "lucide-react";
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
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";

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
          className="relative flex items-center gap-2 h-9 px-2 hover:bg-accent rounded-full"
        >
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium rounded-full">
              {user?.username ? getInitials(user.username) : "AD"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium">
            {user?.username || "Admin"}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
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

function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-16 items-center gap-4 px-4 lg:px-6 shrink-0">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-9 w-full rounded-full bg-muted pl-10 pr-12 border-0 focus-visible:ring-1"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
            <kbd className="h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hidden sm:flex">
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
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <SidebarProvider>
        <div className="min-h-screen w-full bg-background">
          {/* Lifted Layout Container */}
          <div className="flex h-screen p-3 gap-3">
            {/* Desktop Sidebar - Lifted */}
            <aside className="hidden lg:flex w-64 flex-col rounded-2xl bg-sidebar h-full overflow-hidden shrink-0">
              <AdminSidebarComponent />
            </aside>

            {/* Mobile Sidebar Drawer */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetContent 
                side="left" 
                className="w-80 p-3 bg-transparent border-none shadow-none"
              >
                <div className="h-full flex flex-col gap-3 w-full">
                  {/* Mobile Top Bar - Lifted */}
                  <div className="flex items-center justify-between rounded-2xl bg-sidebar px-4 py-3">
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Shield className="size-5 text-primary-foreground" />
                      </div>
                      <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                        Escrow
                      </span>
                    </Link>
                  </div>
                  
                  {/* Sidebar Content - Lifted */}
                  <div className="flex-1 rounded-2xl bg-sidebar overflow-hidden w-full">
                    <SidebarProvider>
                      <AdminSidebarComponent />
                    </SidebarProvider>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Main Content Area - Lifted */}
            <main className="flex-1 flex flex-col rounded-2xl bg-card h-full overflow-hidden min-w-0">
              <TopNav onMenuClick={() => setMobileMenuOpen(true)} />
              <div className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="mx-auto max-w-7xl">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
