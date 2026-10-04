"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, LogOut, Settings, Activity, GraduationCap, UserCircle, Bell } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileNav from "@/components/layout/mobile-nav";
import { useAuthStore } from "@/stores/auth-store";
import { hasPermission, permissions } from "@/lib/authorization/permissions";
import { AuthAdapter } from "@/lib/functional/adapters/auth-adapter";

export default function TopHeader() {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await AuthAdapter.logout(user?.id, user?.tenantId);
    } catch {
      // Clean up client state regardless of server response
    } finally {
      logout();
      toast.success("Signed out successfully");
      router.push("/login");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileNavOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>

          <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-foreground">
              CarePoint
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-foreground">
                {user.username}
              </span>
              <span className="hidden md:block text-[11px] text-muted-foreground">
                {user.email}
              </span>
            </div>
          )}

          
          <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-card"></span>
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>

            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full border border-primary/20 bg-accent p-0 hover:bg-accent focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="User account menu"
              >
                <span className="font-bold text-xs uppercase text-foreground">
                  {user?.username ? user.username.slice(0, 2) : "CP"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {user?.username || "Authenticated User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "user@carepoint.org"}
                  </p>
                  {user?.role && (
                    <div className="pt-1">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {user.role.replace("_", " ")}
                      </Badge>
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  <span>My profile</span>
                </Link>
              </DropdownMenuItem>
              {hasPermission(user?.role, permissions.systemManage) && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span>Settings & Branding</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/system-status" className="flex items-center gap-2 cursor-pointer">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>System Diagnostics</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <MobileNav
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />
    </>
  );
}
