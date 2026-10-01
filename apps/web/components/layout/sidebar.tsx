"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/navigation";
import { hasPermission } from "@/lib/authorization/permissions";

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const filteredItems = user
    ? getNavItems().filter((item) => hasPermission(user.role, item.permission))
    : [];

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-foreground leading-none">
            CarePoint
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            School Portal
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-3">
        <nav className="space-y-1" aria-label="Main navigation">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg border-l-4 border-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "border-primary bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                    : "text-sidebar-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-sidebar-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="rounded-lg border border-sidebar-border bg-muted p-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                {user.username}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                {user.role.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {user.email}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
