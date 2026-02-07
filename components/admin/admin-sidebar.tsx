"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  Shield,
  LogOut,
  BarChart3,
  CreditCard,
  FileText,
  HelpCircle,
  Bot,
  UserCog,
  Component,
  ChevronRight,
  type LucideIcon,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: (NavItem & { items?: NavItem[] })[];
}

const navigation: NavGroup[] = [
  {
    label: "MAIN",
    items: [
      { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "AI Assistant", href: "/admin/ai-assistant", icon: Bot },
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
        items: [
          { title: "All Users", href: "/admin/users", icon: Users },
          { title: "Admins", href: "/admin/users/admins", icon: UserCog },
        ],
      },
      {
        title: "Projects",
        href: "/admin/orders",
        icon: ShoppingCart,
        items: [
          { title: "All Projects", href: "/admin/orders", icon: ShoppingCart },
          { title: "Active", href: "/admin/orders/active", icon: ShoppingCart },
        ],
      },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { title: "Admin Management", href: "/admin/management", icon: UserCog },
      { title: "Admin Roles", href: "/admin/roles", icon: Shield },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    label: "DEMOS",
    items: [
      { title: "UI Component", href: "/admin/components", icon: Component },
    ],
  },
];

function NavItemComponent({
  item,
  isActive,
}: {
  item: NavItem & { items?: NavItem[] };
  isActive: boolean;
}) {
  const { state } = useSidebar();
  const pathname = usePathname();
  const hasSubItems = item.items && item.items.length > 0;
  const [isOpen, setIsOpen] = React.useState(
    hasSubItems ? item.items?.some((sub) => pathname === sub.href) : false
  );

  if (hasSubItems && state === "expanded") {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={item.title}
            className="h-11"
          >
            <item.icon className="size-5" />
            <span>{item.title}</span>
            <ChevronRight
              className={`ml-auto size-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === subItem.href}
                  className="h-10"
                >
                  <Link href={subItem.href}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      tooltip={item.title}
      className="h-11"
    >
      <Link href={item.href}>
        <item.icon className="size-5" />
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  );
}

function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="h-8 w-8 rounded-full"
    >
      {state === "expanded" ? (
        <ChevronLeft className="size-4" />
      ) : (
        <ChevronRightIcon className="size-4" />
      )}
    </Button>
  );
}

export function AdminSidebarComponent() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const { state } = useSidebar();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen flex-col gap-3 p-3 bg-background">
      {/* Top Navigation Bar - Now separate and lifted */}
      <div className="flex items-center justify-between rounded-xl bg-sidebar px-4 py-3">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Shield className="size-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
              Escrow
            </span>
          </Link>
        </div>
      </div>

      {/* Main Sidebar Content - Lifted and separate */}
      <div className="flex flex-1 gap-3 min-h-0">
        {/* Sidebar Navigation */}
        <Sidebar
          collapsible="icon"
          variant="floating"
          className="relative flex-col border-0 bg-sidebar rounded-xl"
        >
          <SidebarContent className="gap-2 py-2">
            {navigation.map((group) => (
              <SidebarGroup key={group.label} className="py-2 px-2">
                <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/50 px-2">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <NavItemComponent
                          item={item}
                          isActive={
                            pathname === item.href ||
                            (item.items?.some((sub) => pathname === sub.href) ??
                              false)
                          }
                        />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border/10 p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Logout"
                  onClick={logout}
                  className="h-11 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <LogOut className="size-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>
      </div>
    </div>
  );
}
