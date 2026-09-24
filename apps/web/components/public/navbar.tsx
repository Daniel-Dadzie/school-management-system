"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, ShieldCheck, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function PublicNavbar() {
  const { accessToken } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/academics" className="hover:text-foreground transition-colors">
            Academics
          </Link>
          <Link href="/admissions" className="hover:text-foreground transition-colors">
            Admissions
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild size="sm">
            <Link href="/admissions/apply">
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

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col space-y-4 px-4 py-6 text-sm font-medium">
            <Link
              href="/"
              className="text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/academics"
              className="text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Academics
            </Link>
            <Link
              href="/admissions"
              className="text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admissions
            </Link>
            <Link
              href="/contact"
              className="text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-4 border-t">
              <Button asChild className="w-full">
                <Link href="/admissions/apply" onClick={() => setMobileMenuOpen(false)}>
                  Apply Now
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}