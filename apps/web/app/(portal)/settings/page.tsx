"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save } from "lucide-react";

import PageShell from "@/components/layout/page-shell";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";
import { useSettings, useUpdateSettings } from "@/lib/api/settings";
import { permissions } from "@/lib/authorization/permissions";

const settingsSchema = z.object({
  institutionName: z.string().min(1, "Institution name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color code"),
  logoUrl: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

function SettingsFormContent() {
  const { data: settings, isLoading: isFetching } = useSettings();
  const { mutateAsync: updateSettings, isPending: isUpdating } = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      institutionName: "",
      contactEmail: "",
      contactPhone: "",
      primaryColor: "#0f172a",
      logoUrl: "",
    },
  });

  // Re-initialize form when data arrives
  useEffect(() => {
    if (settings) {
      reset({
        institutionName: settings.institutionName,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        primaryColor: settings.primaryColor,
        logoUrl: settings.logoUrl || "",
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateSettings(data);
      toast.success("Settings updated successfully");
      
      // Update the CSS variable for primary color at runtime
      document.documentElement.style.setProperty("--primary", data.primaryColor);
    } catch (error) {
      toast.error("Failed to update settings. Please try again.");
    }
  };

  return (
    <>
      {isFetching ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner className="h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="max-w-2xl bg-card rounded-lg border shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input
                id="institutionName"
                placeholder="e.g. CarePoint Community School"
                {...register("institutionName")}
                aria-invalid={!!errors.institutionName}
              />
              {errors.institutionName && (
                <p className="text-xs text-destructive">{errors.institutionName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@school.edu"
                  {...register("contactEmail")}
                  aria-invalid={!!errors.contactEmail}
                />
                {errors.contactEmail && (
                  <p className="text-xs text-destructive">{errors.contactEmail.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="+1 (555) 123-4567"
                  {...register("contactPhone")}
                  aria-invalid={!!errors.contactPhone}
                />
                {errors.contactPhone && (
                  <p className="text-xs text-destructive">{errors.contactPhone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Theme Primary Color (Hex)</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  className="w-12 p-1 h-10"
                  {...register("primaryColor")}
                />
                <Input
                  type="text"
                  placeholder="#0f172a"
                  className="flex-1"
                  {...register("primaryColor")}
                  aria-invalid={!!errors.primaryColor}
                />
              </div>
              {errors.primaryColor && (
                <p className="text-xs text-destructive">{errors.primaryColor.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
              <Input
                id="logoUrl"
                placeholder="https://example.com/logo.png"
                {...register("logoUrl")}
                aria-invalid={!!errors.logoUrl}
              />
              {errors.logoUrl && (
                <p className="text-xs text-destructive">{errors.logoUrl.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Settings
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default function SettingsPage() {
  return (
    <PageShell
      title="Settings & Institution Branding"
      description="Configure institution profile, runtime theme tokens, and portal appearance."
      breadcrumbs={[
        { label: "Home", href: "/dashboard" },
        { label: "Settings" },
      ]}
      permission={permissions.systemManage}
    >
      <SettingsFormContent />
    </PageShell>
  );
}


