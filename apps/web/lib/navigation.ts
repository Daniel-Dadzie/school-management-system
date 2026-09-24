import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  ClipboardList,
  ShieldCheck,
  BookMarked,
  Bell,
  Megaphone,
  UserCircle
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles?: string[];
}

export const getNavItems = (): NavItem[] => [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Classes",
    href: "/teacher-classes",
    icon: BookMarked,
    roles: ["TEACHER"],
  },
  {
    label: "My Children",
    href: "/parent-children",
    icon: Users,
    roles: ["PARENT"],
  },
  {
    label: "Students",
    href: "/students",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "Academics",
    href: "/academic-setup",
    icon: BookOpen,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: CalendarCheck,
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "PARENT"],
  },
  {
    label: "Assessments",
    href: "/assessments",
    icon: FileSpreadsheet,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "Results",
    href: "/results",
    icon: FileSpreadsheet,
    roles: ["PARENT"],
  },
  {
    label: "Announcements",
    href: "/parent-announcements",
    icon: Megaphone,
    roles: ["PARENT"],
  },
  {
    label: "Notifications",
    href: "/parent-notifications",
    icon: Bell,
    roles: ["PARENT"],
  },
  {
    label: "Admissions",
    href: "/admissions-admin",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "Academics",
    href: "/parent-academics",
    icon: BookOpen,
    roles: ["PARENT"],
  },
  {
    label: "Admissions Status",
    href: "/parent-admissions",
    icon: ClipboardList,
    roles: ["PARENT"],
  },
  {
    label: "Users",
    href: "/users",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "My Profile",
    href: "/parent-profile",
    icon: UserCircle,
    roles: ["PARENT"],
  }
];
