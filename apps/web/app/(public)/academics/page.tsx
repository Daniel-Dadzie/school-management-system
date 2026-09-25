import { Metadata } from "next";
import { BookOpen, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Academics | CarePoint Community School",
  description: "Academic programs spanning from Nursery to Junior High School at CarePoint Community School.",
};

export default function AcademicsPage() {
  return (
    <div className="flex-1 bg-background">
      <div className="bg-muted/20 border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Academics
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A comprehensive curriculum emphasizing foundational literacy, STEM, critical inquiry, and analytical reasoning from early childhood through Junior High School.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-xs">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Early Childhood Education</CardTitle>
              <CardDescription>Nursery & Kindergarten</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-4">
                Our early childhood program provides a nurturing environment where young minds can explore and discover. We focus on fine and gross motor development, social collaboration, curiosity, and early phonics.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Play-based learning</li>
                <li>Basic literacy and numeracy</li>
                <li>Creative arts and expression</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <BookOpen className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Primary School</CardTitle>
              <CardDescription>Class 1 - 6</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-4">
                The primary school curriculum builds strong foundational skills across all major disciplines, fostering independent thinking and a love for learning.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>English Language & Mathematics</li>
                <li>Integrated Science & ICT</li>
                <li>Social Studies & Religious/Moral Education</li>
                <li>Creative Arts & Ghanaian Language</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <BookOpen className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Junior High School (JHS)</CardTitle>
              <CardDescription>JHS 1 - 3</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-4">
                Our JHS program offers advanced academic preparation, technical skills development, and strict discipline to prepare students for the Basic Education Certificate Examination (BECE) and future progression.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Advanced Core Subjects</li>
                <li>Pre-Technical Skills & Career Guidance</li>
                <li>Leadership & Mentorship</li>
                <li>BECE Preparation</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-16 bg-primary/5 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Join Our Academic Community</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            We are currently accepting applications for all levels: Nursery, Kindergarten, Primary, and JHS.
          </p>
          <Button asChild size="lg">
            <Link href="/admissions/apply" className="gap-2">
              Start Application <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

