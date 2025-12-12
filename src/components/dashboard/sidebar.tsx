"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Flame,
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  Building2,
  Mail,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Organizacoes",
    href: "/dashboard/organizations",
    icon: Building2,
  },
  {
    name: "Membros",
    href: "/dashboard/members",
    icon: Users,
  },
  {
    name: "Convites",
    href: "/dashboard/invites",
    icon: Mail,
  },
  {
    name: "Assinatura",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    name: "Configuracoes",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background hidden md:flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          <span className="text-xl font-bold">Flame</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
