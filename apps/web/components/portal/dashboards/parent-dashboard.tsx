import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileSpreadsheet, CalendarCheck, Megaphone, Bell, ClipboardList, UserCircle, BookOpen } from "lucide-react";
import Link from "next/link";

export function ParentDashboard() {
  const links = [
    { title: "My Children", href: "/parent-children", icon: Users },
    { title: "Attendance", href: "/attendance", icon: CalendarCheck },
    { title: "Results", href: "/results", icon: FileSpreadsheet },
    { title: "Announcements", href: "/parent-announcements", icon: Megaphone },
    { title: "Notifications", href: "/parent-notifications", icon: Bell },
    { title: "Academics", href: "/parent-academics", icon: BookOpen },
    { title: "Admissions Status", href: "/parent-admissions", icon: ClipboardList },
    { title: "My Profile", href: "/parent-profile", icon: UserCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="hover:bg-accent transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{link.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">View</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
