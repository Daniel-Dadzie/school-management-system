"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function PublicNavbar() {
  const { accessToken } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
              CarePoint
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Community School
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#about" className="hover:text-foreground transition-colors">
            About Us
          </Link>
          <Link href="#academics" className="hover:text-foreground transition-colors">
            Academics
          </Link>
          <Link href="#community" className="hover:text-foreground transition-colors">
            Community
          </Link>
          <Link href="#admissions" className="hover:text-foreground transition-colors">
            Admissions
          </Link>
          <Link href="#contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/admissions">
              Apply Now
            </Link>
          </Button>

          {accessToken ? (
            <Button asChild size="sm">
              <Link href="/dashboard" className="gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>Portal</span>
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login" className="gap-1.5">
                <span>Sign In</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
