import os

navbar = '''"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
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
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/academics" className="hover:text-foreground transition-colors">Academics</Link>
          <Link href="/admissions" className="hover:text-foreground transition-colors">Admissions</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild size="sm">
            <Link href="/admissions/apply">Apply Now</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle mobile menu">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col space-y-4 px-4 py-6 text-sm font-medium">
            <Link href="/" className="text-foreground" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/about" className="text-foreground" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/academics" className="text-foreground" onClick={() => setMobileMenuOpen(false)}>Academics</Link>
            <Link href="/admissions" className="text-foreground" onClick={() => setMobileMenuOpen(false)}>Admissions</Link>
            <Link href="/contact" className="text-foreground" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <div className="pt-4 border-t">
              <Button asChild className="w-full">
                <Link href="/admissions/apply" onClick={() => setMobileMenuOpen(false)}>Apply Now</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
'''

footer = '''import Link from "next/link";
import { GraduationCap, MapPin } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">CarePoint Community School</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Raising learners who uphold Godliness, Excellence, and Ghana at heart.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Navigation</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/academics" className="hover:text-foreground transition-colors">Academics</Link></li>
              <li><Link href="/admissions" className="hover:text-foreground transition-colors">Admissions</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link href="/admissions/apply" className="hover:text-foreground transition-colors font-medium text-primary">Apply Now</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Location</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Anaji, Takoradi, Ghana</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© 2026 CarePoint Community School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
'''

page = '''import Link from "next/link";
import { ArrowRight, BookOpen, Users, Award, CheckCircle2, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        <section className="relative overflow-hidden border-b bg-muted/20 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 gap-1.5 px-3 py-1 text-xs border-primary/30 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Admissions Open for 2026/2027 Academic Year</span>
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
                Nurturing Character, <span className="text-primary">Inspiring Excellence</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                CarePoint Community School provides an enriching, inclusive educational experience grounded in academic rigor, ethical leadership, and dedicated community support.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto text-base">
                  <Link href="/admissions/apply" className="gap-2">
                    <span>Apply for Admission</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-4 border-t pt-8 sm:grid-cols-4 text-left">
                <div><div className="text-2xl font-bold text-foreground">100%</div><div className="text-xs text-muted-foreground">Dedicated Faculty</div></div>
                <div><div className="text-2xl font-bold text-foreground">15:1</div><div className="text-xs text-muted-foreground">Student-Teacher Ratio</div></div>
                <div><div className="text-2xl font-bold text-foreground">Comprehensive</div><div className="text-xs text-muted-foreground">Basic Education Curriculum</div></div>
                <div><div className="text-2xl font-bold text-foreground">Active</div><div className="text-xs text-muted-foreground">Parent Community</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">Why CarePoint</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Built Around Student Growth</p>
              <p className="mt-4 text-muted-foreground text-sm sm:text-base">Our educational framework balances intellectual curiosity, discipline, and emotional well-being.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border shadow-xs hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2"><BookOpen className="h-6 w-6" /></div>
                  <CardTitle className="text-xl">Rigorous Academics</CardTitle>
                  <CardDescription>A comprehensive curriculum emphasizing foundational literacy, STEM, and analytical reasoning.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /><span>Continuous assessment and personalized feedback</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /><span>Structured language and numeracy programs</span></div>
                </CardContent>
              </Card>
              <Card className="border shadow-xs hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2"><Users className="h-6 w-6" /></div>
                  <CardTitle className="text-xl">Community & Character</CardTitle>
                  <CardDescription>Instilling core values of mutual respect, empathy, and active civic participation.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /><span>Collaborative community projects</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /><span>Character education and peer mentorship</span></div>
                </CardContent>
              </Card>
              <Card className="border shadow-xs hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2"><Award className="h-6 w-6" /></div>
                  <CardTitle className="text-xl">Holistic Development</CardTitle>
                  <CardDescription>Cultivating creative expression, athletic participation, and leadership.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /><span>Extracurricular arts, debate, and music</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /><span>Structured physical education and sports</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/10 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">Curriculum Stages</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Learning Pathways</p>
              <p className="mt-4 text-muted-foreground text-sm sm:text-base">Structured progressive development tailored to every child&apos;s developmental milestone.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border bg-card p-6 shadow-xs">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider">Stage 1</div>
                <h3 className="mt-2 text-lg font-bold text-foreground">Early Childhood</h3>
                <p className="mt-2 text-sm text-muted-foreground">Kindergarten & Nursery focusing on motor development, social collaboration, curiosity, and early phonics.</p>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow-xs">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider">Stage 2</div>
                <h3 className="mt-2 text-lg font-bold text-foreground">Primary School (Class 1 - 6)</h3>
                <p className="mt-2 text-sm text-muted-foreground">Core mastery of English, Mathematics, Integrated Science, Social Studies, ICT, and creative arts.</p>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow-xs">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider">Stage 3</div>
                <h3 className="mt-2 text-lg font-bold text-foreground">Junior High School (JHS 1 - 3)</h3>
                <p className="mt-2 text-sm text-muted-foreground">Advanced academic preparation, technical skills development, and guidance for future progression.</p>
              </div>
            </div>
            <div className="mt-12 text-center">
               <Button asChild variant="outline">
                  <Link href="/academics">View Academic Programs</Link>
               </Button>
            </div>
          </div>
        </section>

        <section className="border-t py-20 bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border bg-primary/5 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl space-y-4">
                <Badge variant="outline" className="border-primary text-primary">Simple Online Process</Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Begin Your Child&apos;s Educational Journey</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  We welcome prospective students across all grade levels. Complete our streamlined online application form in just a few minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button asChild size="lg">
                    <Link href="/admissions/apply" className="gap-2">
                      <span>Start Application Form</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-80 rounded-xl border bg-card p-6 shadow-xs space-y-4">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Admissions Timeline</span>
                </h3>
                <ul className="space-y-3 text-xs text-muted-foreground">
                  <li className="flex justify-between border-b pb-2"><span>Application</span><span className="font-medium text-foreground">Rolling</span></li>
                  <li className="flex justify-between border-b pb-2"><span>Document Verification</span><span className="font-medium text-foreground">3 - 5 days</span></li>
                  <li className="flex justify-between border-b pb-2"><span>Parent Interview</span><span className="font-medium text-foreground">Scheduled</span></li>
                  <li className="flex justify-between"><span>Term Start</span><span className="font-medium text-foreground">September 2026</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
'''

with open('apps/web/components/public/navbar.tsx', 'w', encoding='utf-8') as f: f.write(navbar)
with open('apps/web/components/public/footer.tsx', 'w', encoding='utf-8') as f: f.write(footer)
with open('apps/web/app/(public)/page.tsx', 'w', encoding='utf-8') as f: f.write(page)
