import { Settings,
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  ClipboardList,
  ShieldCheck,
  BookMarked,
  Megaphone,
  UserCircle,
  Award,
  FileClock,
} from "lucide-react";
import { permissions, type Permission } from "@/lib/authorization/permissions";
import { isMockMode } from "@/lib/functional/config";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission: Permission;
}

export const getNavItems = (): NavItem[] => [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: permissions.dashboardView,
  },
  {
    label: "My Classes",
    href: "/teacher-classes",
    icon: BookMarked,
    permission: permissions.teacherClassesView,
  },
  {
    label: "My Children",
    href: "/parent-children",
    icon: Users,
    permission: permissions.parentChildrenView,
  },
  {
    label: "Students",
    href: "/students",
    icon: Users,
    permission: permissions.studentsManage,
  },
  {
    label: "Enrollments",
    href: "/enrollments",
    icon: ClipboardList,
    permission: permissions.enrollmentsManage,
  },
  {
    label: "Academics",
    href: "/academic-setup",
    icon: BookOpen,
    permission: permissions.academicsManage,
  },
  {
    label: "Promotions",
    href: "/academic-setup/promotions",
    icon: Award,
    permission: permissions.promotionsManage,
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: CalendarCheck,
    permission: permissions.attendanceView,
  },
  {
    label: "Finance",
    href: "/finance",
    icon: FileSpreadsheet,
    permission: permissions.financeView,
  },
  {
    label: "Assessments",
    href: "/assessments",
    icon: FileSpreadsheet,
    permission: permissions.assessmentsView,
  },
  {
    label: "Results",
    href: "/results",
    icon: FileSpreadsheet,
    permission: permissions.resultsView,
  },
  {
    label: "Report Cards",
    href: "/report-cards",
    icon: FileSpreadsheet,
    permission: permissions.resultsView,
  },
  {
    label: "Grading",
    href: "/grading",
    icon: Award,
    permission: permissions.academicsManage,
  },
  {
    label: "Announcements",
    href: "/parent-announcements",
    icon: Megaphone,
    permission: permissions.announcementsView,
  },
  {
    label: "Admissions",
    href: "/admissions-admin",
    icon: ClipboardList,
    permission: permissions.admissionsManage,
  },
  {
    label: "Academics",
    href: "/parent-academics",
    icon: BookOpen,
    permission: permissions.parentAcademicsView,
  },
  {
    label: "Admissions Status",
    href: "/parent-admissions",
    icon: ClipboardList,
    permission: permissions.admissionsOwnView,
  },
  {
    label: "Users",
    href: "/users",
    icon: ShieldCheck,
    permission: permissions.usersManage,
  },
  {
    label: "My Profile",
    href: "/parent-profile",
    icon: UserCircle,
    permission: permissions.profileView,
  }
  ,
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    permission: permissions.systemManage,
  },
  {
    label: "Audit logs",
    href: "/audit",
    icon: FileClock,
    permission: permissions.systemManage,
  }
].filter((item) => isMockMode || item.href !== "/academic-setup/promotions");



