import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdmissionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header Section */}
      <section className="bg-muted/30 py-16 md:py-24 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            Admissions
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Join the CarePoint Community School family. We welcome applications for Nursery, Kindergarten, Primary, and Junior High School (JHS).
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/admissions/apply" className="gap-2">
                Start Your Application <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">The Application Process</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Online Application</h3>
                    <p className="text-sm text-muted-foreground mt-1">Complete the online application form with the applicant&apos;s details and your contact information.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Document Submission</h3>
                    <p className="text-sm text-muted-foreground mt-1">Provide copies of previous academic records (if applicable), birth certificate, and passport-sized photographs.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Assessment & Interview</h3>
                    <p className="text-sm text-muted-foreground mt-1">Applicants may be scheduled for an entrance assessment. Parents will also have a brief interview with the academic staff.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Offer of Admission</h3>
                    <p className="text-sm text-muted-foreground mt-1">Successful applicants will receive a formal offer letter and an admission pack.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/10 rounded-2xl p-8 border">
              <h2 className="text-xl font-bold text-foreground mb-6">Required Documents</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Completed application form</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Copy of birth certificate or passport</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Two recent passport-sized photographs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Past two years&apos; academic reports (for Primary and JHS applicants)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Immunization records (for Nursery and Kindergarten)</span>
                </li>
              </ul>
              
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-semibold text-foreground mb-2">Need Assistance?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our admissions office is open Monday to Friday, 8:00 AM to 4:00 PM.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">Contact Admissions Team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
