"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  Shield,
  LogOut,
  Bot,
  UserCog,
  Component,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

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
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
      },
    ],
  }
];

function NavItemComponent({
  item,
  isActive,
}: {
  item: NavItem & { items?: NavItem[] };
  isActive: boolean;
}) {
  const pathname = usePathname();
  const hasSubItems = item.items && item.items.length > 0;
  const [isOpen, setIsOpen] = React.useState(
    hasSubItems ? item.items?.some((sub) => pathname === sub.href) : false
  );

  if (hasSubItems) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={item.title}
            className="h-10 w-full"
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.title}</span>
            <ChevronRight
              className={`ml-auto size-4 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-l-0 pl-4 w-full">
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.href} className="w-full">
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === subItem.href}
                  className="h-9 w-full"
                >
                  <Link href={subItem.href}>
                    <span className="truncate">{subItem.title}</span>
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
      className="h-10 w-full"
    >
      <Link href={item.href}>
        <item.icon className="size-4 shrink-0" />
        <span className="truncate">{item.title}</span>
      </Link>
    </SidebarMenuButton>
  );
}

export function AdminSidebarComponent() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <div className="flex h-full w-full flex-col bg-sidebar">
      {/* Navigation */}
      <SidebarContent className="flex-1 overflow-y-auto w-full">
        {navigation.map((group) => (
          <SidebarGroup key={group.label} className="py-2 px-3 w-full">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-2 mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent className="w-full">
              <SidebarMenu className="w-full">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href} className="w-full">
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

      {/* Footer */}
      <SidebarFooter className="p-3 w-full">
        <SidebarMenu className="w-full">
          <SidebarMenuItem className="w-full">
            <SidebarMenuButton
              tooltip="Logout"
              onClick={logout}
              className="h-10 w-full text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="truncate">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </div>
  );
}
