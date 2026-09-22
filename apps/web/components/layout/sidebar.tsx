"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Settings,
  BookOpen,
  UserCheck,
  ClipboardList,
  Building2,
  Activity,
  FileText,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Academic Years",
    href: "/academics",
    icon: Calendar,
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    label: "Classes",
    href: "/classes",
    icon: Building2,
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    label: "Subjects",
    href: "/subjects",
    icon: BookOpen,
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    label: "Teacher Assignments",
    href: "/teacher-assignments",
    icon: UserCheck,
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    label: "Enrollments",
    href: "/enrollments",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "Public Admissions",
    href: "/admissions",
    icon: FileText,
  },
  {
    label: "System Status",
    href: "/system-status",
    icon: Activity,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!user?.role) return true;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="rounded-lg border bg-muted/40 p-3 mt-4">
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
