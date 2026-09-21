import { ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopHeader from "@/components/layout/top-header";
import MobileNav from "@/components/layout/mobile-nav";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-muted/20">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
