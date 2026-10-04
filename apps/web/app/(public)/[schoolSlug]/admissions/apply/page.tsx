import type { Metadata } from "next";
import { AdmissionWizard } from "../../../admissions/apply/wizard";

export const metadata: Metadata = {
  title: "Apply for Admission",
  description: "Submit a school admission application.",
};

export default async function TenantAdmissionApplyPage({
  params,
}: {
  params: Promise<{ schoolSlug: string }>;
}) {
  const { schoolSlug } = await params;

  return (
    <div className="flex-1 bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Admission Application
          </h1>
          <p className="mt-3 text-muted-foreground">
            Complete the application and submit it to the selected school.
          </p>
        </div>
        <AdmissionWizard schoolSlug={schoolSlug} />
      </div>
    </div>
  );
}
