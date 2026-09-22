"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  GraduationCap,
  LayoutDashboard,
  Settings,
  BookOpen,
  UserCheck,
  ClipboardList,
  Building2,
  Activity,
  FileText,
} from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
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

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!user?.role) return true;
    return item.roles.includes(user.role);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-left text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span>CarePoint</span>
          </SheetTitle>
        </SheetHeader>

        <nav
          className="flex flex-col gap-1 px-3 py-4 overflow-y-auto max-h-[calc(100vh-5rem)]"
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
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
