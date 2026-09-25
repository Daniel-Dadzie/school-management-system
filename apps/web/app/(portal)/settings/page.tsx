"use client";

import PageShell from "@/components/layout/page-shell";

export default function SettingsPage() {
  return (
    <PageShell
      title="Settings & Institution Branding"
      description="Configure institution profile, runtime theme tokens, and portal appearance."
      breadcrumbs={[
        { label: "Home", href: "/dashboard" },
        { label: "Settings" },
      ]}
     allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p>Settings and Branding configuration will be implemented in a future batch to connect with the backend API.</p>
      </div>
    </PageShell>
  );
}
