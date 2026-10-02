"use client";
import Sidebar from "@/components/layout/sidebar";
import TopHeader from "@/components/layout/top-header";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUiStore();

  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full bg-background">
        <div className={cn(
          "hidden md:block fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-56"
        )}>
          <Sidebar />
        </div>
        <div className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "md:pl-16" : "md:pl-56"
        )}>
          <TopHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
