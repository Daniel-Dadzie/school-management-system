import Link from "next/link";
import { Activity, Settings, Users } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const oversightLinks = [
  { title: "Users", description: "Manage system accounts and roles.", href: "/users", icon: Users },
  { title: "System status", description: "Check configured service integrations.", href: "/system-status", icon: Activity },
  { title: "Settings", description: "Manage school-level system settings.", href: "/settings", icon: Settings },
];

export function ITAdminDashboard() {
  return (
    <section aria-label="IT administration overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {oversightLinks.map(({ title, description, href, icon: Icon }) => (
        <Link key={href} href={href} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:bg-accent/25 hover:shadow-md cursor-pointer">
            <CardHeader>
              <Icon className="mb-2 h-8 w-8 text-primary" aria-hidden="true" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </section>
  );
}
