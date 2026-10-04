"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { AuthAdapter } from "@/lib/functional/adapters/auth-adapter";

const schema = z.object({
  currentPassword: z.string().min(1, "Enter your temporary password."),
  newPassword: z.string().min(12, "Use at least 12 characters.").max(72, "Use no more than 72 characters."),
  confirmPassword: z.string().min(1, "Confirm your new password."),
}).refine((values) => values.newPassword === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "The passwords do not match.",
});

type FormValues = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { accessToken, user, setAuth, logout } = useAuthStore();
  const [serverError, setServerError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    let active = true;
    if (!accessToken) {
      void AuthAdapter.refresh(null).then((session) => {
        if (!active) return;
        if (!session) {
          logout();
          router.replace("/login");
          return;
        }
        setAuth(session.accessToken, session.user);
        if (!session.user.passwordChangeRequired) router.replace("/dashboard");
      });
    } else if (!user?.passwordChangeRequired) {
      router.replace("/dashboard");
    }
    return () => { active = false; };
  }, [accessToken, logout, router, setAuth, user?.passwordChangeRequired]);

  const onSubmit = async ({ currentPassword, newPassword }: FormValues) => {
    setIsSaving(true);
    setServerError(false);
    try {
      await authApi.changeInitialPassword(currentPassword, newPassword);
      if (accessToken && user) setAuth(accessToken, { ...user, passwordChangeRequired: false });
      toast.success("Your password has been updated.");
      router.replace("/dashboard");
    } catch {
      setServerError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section aria-labelledby="change-password-title">
      <div className="mb-6 text-center">
        <h1 id="change-password-title" className="text-xl font-semibold tracking-tight text-foreground">
          Change your temporary password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Set a new password before continuing to the platform.
        </p>
      </div>

      {serverError && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>We could not update your password. Check your current password and try again.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Temporary password</Label>
          <Input id="currentPassword" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.currentPassword)} {...register("currentPassword")} />
          {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input id="newPassword" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.newPassword)} {...register("newPassword")} />
          {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? "Updating..." : "Update password"}
        </Button>
      </form>
    </section>
  );
}
