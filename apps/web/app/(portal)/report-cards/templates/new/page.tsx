"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageShell from "@/components/layout/page-shell";
import { TemplateForm } from "@/components/reporting/template-form";
import { useCreateReportTemplate } from "@/hooks/use-reporting";
import { permissions } from "@/lib/authorization/permissions";
import type { ReportTemplateFormData } from "@/lib/validations/reporting";

export default function NewReportTemplate() {
  const router = useRouter();
  const createMutation = useCreateReportTemplate();

  const handleSubmit = async (data: ReportTemplateFormData) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Template created successfully");
      router.push("/report-cards/templates");
    } catch (error) {
      console.error("Failed to create template:", error);
      toast.error("Failed to create template. Please check the form data and try again.");
    }
  };

  return (
    <PageShell
      title="New Report Template"
      description="Create a new report template for the school."
      breadcrumbs={[
        { label: "Report Cards", href: "/report-cards" },
        { label: "Templates", href: "/report-cards/templates" },
        { label: "New" },
      ]}
      permission={permissions.reportingManage}
    >
      <div className="rounded-lg border bg-card p-6">
        <TemplateForm 
          onSubmit={handleSubmit} 
          isSubmitting={createMutation.isPending} 
        />
      </div>
    </PageShell>
  );
}
