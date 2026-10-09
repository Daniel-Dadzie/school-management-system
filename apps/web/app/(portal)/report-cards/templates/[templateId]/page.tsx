/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { TemplateForm } from "@/components/reporting/template-form";
import { useReportTemplate, useUpdateReportTemplate, useDeleteReportTemplate } from "@/hooks/use-reporting";
import { permissions } from "@/lib/authorization/permissions";
import type { ReportTemplateFormData } from "@/lib/validations/reporting";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { AuthorizationError } from "@/lib/authorization/permissions";

interface EditReportTemplateProps {
  params: Promise<{ templateId: string }>;
}

export default function EditReportTemplate({ params }: EditReportTemplateProps) {
  const { templateId } = use(params);
  const router = useRouter();
  
  const templateQuery = useReportTemplate(templateId);
  const updateMutation = useUpdateReportTemplate();
  const deleteMutation = useDeleteReportTemplate();
  
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (data: ReportTemplateFormData) => {
    try {
      await updateMutation.mutateAsync({ id: templateId, data });
      toast.success("Template updated successfully");
      router.push("/report-cards/templates");
    } catch (error) {
      console.error("Failed to update template:", error);
      toast.error("Failed to update template. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this template? This cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(templateId);
      toast.success("Template deleted successfully");
      router.push("/report-cards/templates");
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Failed to delete template. It may be in use by generated reports.");
      setIsDeleting(false);
    }
  };

  const loading = templateQuery.isLoading;
  const error = templateQuery.error;
  const forbidden = error instanceof AuthorizationError || 
    (error as any)?.response?.status === 403;

  return (
    <PageShell
      title="Edit Report Template"
      description="Modify an existing report template."
      breadcrumbs={[
        { label: "Report Cards", href: "/report-cards" },
        { label: "Templates", href: "/report-cards/templates" },
        { label: "Edit" },
      ]}
      permission={permissions.reportingManage}
      actions={
        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || loading}>
          <Trash2 aria-hidden="true" className="mr-2 h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      }
    >
      {loading ? (
        <div className="flex min-h-48 items-center justify-center" role="status">
          <LoadingSpinner />
          <span className="ml-2 text-sm text-muted-foreground">Loading template...</span>
        </div>
      ) : forbidden ? (
        <ForbiddenState title="Access denied" />
      ) : error || !templateQuery.data ? (
        <ErrorState title="Unable to load template" description="The template may have been deleted." onRetry={() => templateQuery.refetch()} />
      ) : (
        <div className="rounded-lg border bg-card p-6">
          <TemplateForm 
            initialData={{
              name: templateQuery.data.name,
              description: templateQuery.data.description || "",
              isActive: templateQuery.data.isActive,
              config: templateQuery.data.config,
            }}
            onSubmit={handleSubmit} 
            isSubmitting={updateMutation.isPending} 
          />
        </div>
      )}
    </PageShell>
  );
}
