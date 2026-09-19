import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  GraduationCap,
  Settings,
  BookOpen,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-background md:flex">
      <div className="flex flex-1 flex-col overflow-y-auto py-4">
        <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>

          <Link
            href="/academics"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            Academics
          </Link>

          <Link
            href="/students"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            Students
          </Link>

          <Link
            href="/teachers"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Teachers
          </Link>

          <Link
            href="/attendance"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Attendance
          </Link>
        </nav>

        <div className="px-3 py-4">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
