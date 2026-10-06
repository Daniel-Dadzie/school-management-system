"use client";

import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import type { ReportTemplateFormData } from "@/lib/validations/reporting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TemplateFormProps {
  initialData?: ReportTemplateFormData;
  onSubmit: (data: ReportTemplateFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const DEFAULT_CONFIG = JSON.stringify({
  showRanking: true,
  showAttendance: true,
  showCompetencies: false,
  headerLogoUrl: ""
}, null, 2);

export function TemplateForm({ initialData, onSubmit, isSubmitting }: TemplateFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ReportTemplateFormData>({
    defaultValues: initialData || {
      name: "",
      description: "",
      isActive: true,
      config: DEFAULT_CONFIG,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium leading-none">Template Name</label>
          <Input placeholder="e.g., Standard Terminal Report" {...register("name", { required: "Name is required" })} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          <p className="text-sm text-muted-foreground">A descriptive name for this report template.</p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium leading-none">Description (Optional)</label>
          <Textarea placeholder="Details about when this template is used..." {...register("description")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium leading-none">Configuration (JSON)</label>
          <Textarea 
            className="font-mono text-sm" 
            rows={8} 
            placeholder="{}" 
            {...register("config", { 
              required: "Config is required",
              validate: (value) => {
                try {
                  JSON.parse(value);
                  return true;
                } catch {
                  return "Config must be valid JSON";
                }
              }
            })} 
          />
          {errors.config && <p className="text-sm text-red-500">{errors.config.message}</p>}
          <p className="text-sm text-muted-foreground">JSON configuration governing report display settings.</p>
        </div>

        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 sm:col-span-2">
          <input
            type="checkbox"
            className="mt-1"
            {...register("isActive")}
          />
          <div className="space-y-1 leading-none">
            <label className="text-sm font-medium leading-none">Active Template</label>
            <p className="text-sm text-muted-foreground">
              Only active templates can be used when generating new report cards.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          <Save aria-hidden="true" className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Template"}
        </Button>
      </div>
    </form>
  );
}
