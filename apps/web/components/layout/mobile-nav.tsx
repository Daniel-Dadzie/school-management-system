"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/navigation";
import { hasPermission } from "@/lib/authorization/permissions";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const filteredItems = user
    ? getNavItems().filter((item) => hasPermission(user.role, item.permission))
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="h-dvh w-64 max-w-full gap-0 overflow-hidden border-r-sidebar-border bg-sidebar p-0"
      >
        <SheetHeader className="shrink-0 border-b border-sidebar-border px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-left text-sidebar-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span>CarePoint</span>
          </SheetTitle>
        </SheetHeader>

        <nav
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-3 py-4"
          aria-label="Mobile navigation"
        >
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-lg border-l-4 border-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-foreground",
                  isActive
                    ? "border-sidebar-foreground bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                    : "text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 text-sidebar-foreground" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
