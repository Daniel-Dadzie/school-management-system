"use client";

import Link from "next/link";
import { Bell, Menu, UserCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import MobileNav from "@/components/layout/mobile-nav";

export default function TopHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
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

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary font-bold text-primary-foreground">
              CP
            </div>

            <span className="hidden text-lg font-bold text-primary md:inline-block">
              CarePoint
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="User profile"
          >
            <UserCircle className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <MobileNav
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />
    </>
  );
}
