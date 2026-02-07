"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Settings,
  LogOut,
  Wallet,
  CreditCard,
  Receipt,
  HelpCircle,
  Landmark,
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
  SidebarHeader,
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
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      {
        title: "Orders",
        href: "/dashboard/orders",
        icon: ShoppingCart,
        items: [
          { title: "All Orders", href: "/dashboard/orders", icon: ShoppingCart },
          { title: "Create Order", href: "/dashboard/orders/create", icon: ShoppingCart },
        ],
      },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { title: "Wallet", href: "/dashboard/wallet", icon: Wallet },
      {
        title: "Accounts",
        href: "/dashboard/wallet/usd-account",
        icon: Landmark,
        items: [
          { title: "USD Account", href: "/dashboard/wallet/usd-account", icon: Landmark },
          { title: "USDT Wallet", href: "/dashboard/wallet/usdt-wallet", icon: CreditCard },
        ],
      },
      { title: "Transactions", href: "/dashboard/wallet/transactions", icon: Receipt },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
      { title: "Help Center", href: "/dashboard/help", icon: HelpCircle },
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
          <SidebarMenuSub className="border-l-0 pl-4">
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === subItem.href}
                  className="h-9"
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

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo Header */}
      <SidebarHeader className="p-4 hidden lg:block">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="size-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            Escrow
          </span>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="flex-1 overflow-y-auto px-3">
        {navigation.map((group) => (
          <SidebarGroup key={group.label} className="py-2">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-2 mb-1">
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

      {/* Footer */}
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
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
