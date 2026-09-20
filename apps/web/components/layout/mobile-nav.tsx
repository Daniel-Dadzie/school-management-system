"use client";

import Link from "next/link";
import {
  Calendar,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  BookOpen,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/academics",
    label: "Academics",
    icon: GraduationCap,
  },
  {
    href: "/students",
    label: "Students",
    icon: Users,
  },
  {
    href: "/teachers",
    label: "Teachers",
    icon: BookOpen,
  },
  {
    href: "/attendance",
    label: "Attendance",
    icon: Calendar,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileNav({
  open,
  onOpenChange,
}: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-left text-primary">
            CarePoint
          </SheetTitle>
        </SheetHeader>

        <nav
          className="flex flex-col gap-1 px-3 py-4"
          aria-label="Mobile navigation"
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
