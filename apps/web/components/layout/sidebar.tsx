"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/navigation";
import { hasPermission } from "@/lib/authorization/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = user
    ? getNavItems().filter((item) => hasPermission(user.role, item.permission))
    : [];

  return (
    <aside className="flex flex-col h-full border-r bg-sidebar">
      <div className={cn(
        "flex h-16 items-center border-b transition-all duration-300",
        sidebarCollapsed ? "justify-center px-0" : "gap-3 px-5"
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col overflow-hidden whitespace-nowrap">
            <span className="text-base font-bold tracking-tight text-foreground leading-none">
              CarePoint
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              School Portal
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-3 overflow-x-hidden">
        <nav className="space-y-1" aria-label="Main navigation">
          <TooltipProvider delayDuration={0}>
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg border-l-4 border-transparent text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    sidebarCollapsed ? "justify-center py-3 px-0" : "gap-3 px-3 py-2",
                    isActive
                      ? "border-primary bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                      : "text-sidebar-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={cn("shrink-0", sidebarCollapsed ? "h-5 w-5" : "h-4 w-4", isActive ? "text-primary" : "text-sidebar-foreground")} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{linkContent}</div>;
            })}
          </TooltipProvider>
        </nav>

        <div className="mt-4 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn("w-full text-muted-foreground hover:text-foreground", sidebarCollapsed ? "px-0" : "justify-start")}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5 mx-auto" /> : <><ChevronLeft className="h-4 w-4 mr-2" /> Collapse</>}
          </Button>

          {user && (
            <div className={cn(
              "rounded-lg border border-sidebar-border bg-muted transition-all duration-300",
              sidebarCollapsed ? "p-2 text-center" : "p-3"
            )}>
              {sidebarCollapsed ? (
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                      {user.username}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider px-1 py-0 h-4">
                      {user.role.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {user.email}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
