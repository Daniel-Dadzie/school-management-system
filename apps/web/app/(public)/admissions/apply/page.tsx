import { Metadata } from "next";
import { AdmissionWizard } from "./wizard";

export const metadata: Metadata = {
  title: "Apply for Admission | CarePoint Community School",
  description: "Complete the 4-step online application for admission to CarePoint Community School.",
};

export default function ApplyPage() {
  return (
    <div className="flex-1 bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Admission Application
          </h1>
          <p className="mt-3 text-muted-foreground">
            Please complete all four steps below. Your information is securely submitted to our admissions team.
          </p>
        </div>
        
        <AdmissionWizard />
      </div>
    </div>
  );
}

