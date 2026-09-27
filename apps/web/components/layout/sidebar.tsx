"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const filteredItems = getNavItems().filter((item) => {
    if (!item.roles) return true;
    if (!user?.role) return true;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-sidebar-foreground leading-none">
            CarePoint
          </span>
          <span className="text-[11px] text-sidebar-foreground mt-0.5">
            School Portal
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
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
                  "flex items-center gap-3 rounded-lg border-l-4 border-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-foreground",
                  isActive
                    ? "border-sidebar-foreground bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                    : "text-sidebar-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4 text-sidebar-foreground" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent p-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sidebar-accent-foreground truncate max-w-[120px]">
                {user.username}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider">
                {user.role.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-[11px] text-sidebar-accent-foreground truncate mt-0.5">
              {user.email}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
