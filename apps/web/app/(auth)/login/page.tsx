"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { useAuthStore, User } from "@/stores/auth-store";

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or username is required")
    .max(100, "Identifier must not exceed 100 characters"),
  password: z
    .string()
    .min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface AuthApiResponse {
  accessToken: string;
  user: User;
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await apiClient<AuthApiResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        requiresAuth: false,
      });

      if (response.accessToken && response.user) {
        setAuth(response.accessToken, response.user);
        toast.success(`Welcome back, ${response.user.username}!`);
        router.push("/dashboard");
      } else {
        throw new Error("Invalid authentication response format");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setServerError("Invalid email/username or password.");
        } else if (err.status === 403) {
          setServerError("Account is disabled. Please contact the school administrator.");
        } else {
          setServerError(err.message || "Failed to sign in. Please try again.");
        }
      } else {
        setServerError("Unable to connect to the authentication service. Please verify your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
        </div>
        <h2 className="mb-2 text-lg font-bold text-primary">CarePoint Community School</h2>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to access your CarePoint portal.
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or Username</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="identifier"
              type="text"
              placeholder="e.g. admin@carepoint.org or jsmith"
              className="pl-9"
              autoComplete="username"
              disabled={isLoading}
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? "identifier-error" : undefined}
              {...register("identifier")}
            />
          </div>
          {errors.identifier && (
            <p id="identifier-error" className="text-xs text-destructive">
              {errors.identifier.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="pl-9"
              autoComplete="current-password"
              disabled={isLoading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground space-y-2">
        <p>
          Need to submit a student application?{" "}
          <Link
            href="/admissions"
            className="font-medium text-primary hover:underline"
          >
            Apply for Admission
          </Link>
        </p>
        <p>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            Return to Public Website
          </Link>
        </p>
      </div>
    </div>
  );
}
