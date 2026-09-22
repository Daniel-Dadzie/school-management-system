"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { LoadingSpinner } from "@/components/ui/loading";
import { apiClient } from "@/lib/api/client";
import { useAuthStore, User } from "@/stores/auth-store";

interface AuthResponse {
  accessToken: string;
  user: User;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, setAuth, logout } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(!accessToken);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      if (accessToken) {
        setIsVerifying(false);
        return;
      }

      try {
        const data = await apiClient<AuthResponse>("/auth/refresh", {
          method: "POST",
          requiresAuth: false,
        });

        if (isMounted) {
          if (data && data.accessToken && data.user) {
            setAuth(data.accessToken, data.user);
            setIsVerifying(false);
          } else {
            logout();
            router.replace("/login");
          }
        }
      } catch {
        if (isMounted) {
          logout();
          router.replace("/login");
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [accessToken, setAuth, logout, router]);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm animate-pulse">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              CarePoint Portal
            </h2>
            <p className="text-xs text-muted-foreground">
              Verifying session authentication...
            </p>
          </div>
          <LoadingSpinner className="h-5 w-5 text-primary mt-2" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
