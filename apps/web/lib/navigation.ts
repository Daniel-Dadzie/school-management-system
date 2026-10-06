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
  Activity,
  ServerCrash,
  UserCog,
  UserPlus,
  AlertTriangle,
  Library,
  CreditCard,
  FileText,
  MessageSquare,
  Calendar,
  Wallet
} from "lucide-react";
import { permissions, type Permission } from "@/lib/authorization/permissions";
import { isMockMode } from "@/lib/functional/config";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission: Permission;
  children?: Omit<NavItem, 'icon' | 'children'>[];
}

export const getNavItems = (): NavItem[] => [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: permissions.dashboardView,
  },
  
  // -- SCHOOL IT ADMINISTRATION --
  {
    label: "System Health",
    href: "/system-status",
    icon: Activity,
    permission: permissions.systemManage,
  },
  {
    label: "Integrations",
    href: "/integrations",
    icon: ServerCrash,
    permission: permissions.systemManage,
  },
  {
    label: "Audit Logs",
    href: "/audit",
    icon: FileClock,
    permission: permissions.systemManage,
  },
  {
    label: "School Users",
    href: "/users",
    icon: ShieldCheck,
    permission: permissions.systemManage,
  },
  
  // -- ADMIN OPERATIONAL --
  {
    label: "Admissions",
    href: "/admissions-admin",
    icon: ClipboardList,
    permission: permissions.admissionsManage,
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
    icon: UserPlus,
    permission: permissions.enrollmentsManage,
  },
  {
    label: "Discipline",
    href: "/discipline",
    icon: AlertTriangle,
    permission: permissions.studentsManage,
  },
  {
    label: "HR & Staff",
    href: "/staff",
    icon: UserCog,
    permission: permissions.usersManage,
  },

  // -- ADMIN ACADEMICS --
  {
    label: "Academics",
    href: "/academic-setup",
    icon: BookOpen,
    permission: permissions.academicsManage,
    children: [
      { label: "Overview", href: "/academic-setup", permission: permissions.academicsManage },
      { label: "Grading", href: "/grading", permission: permissions.academicsManage },
      { label: "Promotions", href: "/academic-setup/promotions", permission: permissions.promotionsManage },
      { label: "Assessments", href: "/assessments", permission: permissions.assessmentsView },
      { label: "Results", href: "/results", permission: permissions.resultsView },
      { label: "Report Cards", href: "/report-cards", permission: permissions.resultsView },
      { label: "Report Templates", href: "/report-cards/templates", permission: permissions.academicsManage },
    ]
  },
  
  // -- TEACHER --
  {
    label: "My Classes",
    href: "/teacher-classes",
    icon: BookMarked,
    permission: permissions.teacherClassesView,
  },
  {
    label: "Gradebook",
    href: "/gradebook",
    icon: FileSpreadsheet,
    permission: permissions.teacherClassesView,
    children: [
      { label: "Assessments", href: "/assessments", permission: permissions.assessmentsView },
      { label: "Results", href: "/results", permission: permissions.resultsView },
      { label: "Report Cards", href: "/report-cards", permission: permissions.resultsView },
    ]
  },
  {
    label: "Lesson Plans",
    href: "/lesson-plans",
    icon: Library,
    permission: permissions.teacherClassesView,
  },
  {
    label: "Behavior",
    href: "/teacher-behavior",
    icon: AlertTriangle,
    permission: permissions.teacherClassesView,
  },

  // -- PARENT --
  {
    label: "My Children",
    href: "/parent-children",
    icon: Users,
    permission: permissions.parentChildrenView,
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
    label: "Billing & Fees",
    href: "/finance/outstanding",
    icon: CreditCard,
    permission: permissions.parentChildrenView,
  },
  {
    label: "Forms & Consents",
    href: "/parent-forms",
    icon: FileText,
    permission: permissions.parentChildrenView,
  },

  // -- COMMON / ALL ROLES --
  {
    label: "Attendance",
    href: "/attendance",
    icon: CalendarCheck,
    permission: permissions.attendanceView,
  },
  {
    label: "Communications",
    href: "/communications",
    icon: MessageSquare,
    permission: permissions.dashboardView, 
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: Calendar,
    permission: permissions.dashboardView,
  },
  {
    label: "Finance",
    href: "/finance",
    icon: Wallet,
    permission: permissions.financeView,
  },
].filter((item) => isMockMode || !item.children?.some(c => c.href === "/academic-setup/promotions"));
