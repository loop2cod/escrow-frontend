"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/lib/types";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Bell, Search, Sun, Moon, ChevronDown, Menu, LayoutDashboard } from "lucide-react";
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
import { useTheme } from "@/components/theme-provider";

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
          className="relative flex items-center gap-2 lg:h-9 h-5  hover:bg-accent rounded-full ring-0 p-0 focus-visible:ring-0 focus-visible:outline-none focus:outline-none"
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

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">
        {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      </span>
    </Button>
  );
}

function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-14 items-center lg:justify-end justify-between gap-4 px-4 lg:px-6 shrink-0 bg-card border-b">
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
      {/* <div className="flex-1 max-w-md">
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
      </div> */}

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Nav */}
        {/* <UserNav /> */}
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={[UserRole.USER]}>
      <SidebarProvider>
        <div className="min-h-screen w-full bg-background">
          {/* Lifted Layout Container */}
          <div className="flex h-screen p-3 gap-3">
            {/* Desktop Sidebar - Lifted */}
            <aside className="hidden lg:flex w-64 flex-col rounded-2xl bg-sidebar h-full overflow-hidden shrink-0">
              <AppSidebar />
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
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <LayoutDashboard className="size-5 text-primary-foreground" />
                      </div>
                      <span className="font-semibold text-lg tracking-tight text-sidebar-foreground">
                        SecureEscrow
                      </span>
                    </Link>
                  </div>

                  {/* Sidebar Content - Lifted */}
                  <div className="flex-1 rounded-2xl bg-sidebar overflow-hidden w-full">
                    <SidebarProvider>
                      <AppSidebar />
                    </SidebarProvider>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Main Content Area - Lifted */}
            <main className="flex-1 flex flex-col rounded-2xl bg-card h-full overflow-hidden min-w-0">
              <TopNav onMenuClick={() => setMobileMenuOpen(true)} />
              <div className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="mx-auto">
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
