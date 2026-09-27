"use client";

import { UserCreateRequest, useCreateUser } from "@/lib/api/users";
import { isMockMode } from "@/lib/functional/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function UserForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserCreateRequest>({
    username: "",
    email: "",
    role: "TEACHER",
    firstName: "",
    lastName: "",
  });

  const mutation = useCreateUser();
  // Successful creation is handled by the domain mutation hook.
  const handleSuccess = () => {
      toast.success("User created successfully.");
      router.push("/users");
  };
  const handleError = (err: Error) => {
      // We expect this to fail right now as the backend isn't implemented.
      toast.error(err?.message || "Failed to create user. The API may not be implemented yet.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData, { onSuccess: handleSuccess, onError: handleError });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Details</CardTitle>
      </CardHeader>
      <CardContent>
        {!isMockMode && (
          <div className="mb-6">
            <EmptyState
              title="Backend Dependency Missing"
              description="The POST /users API contract does not currently exist. Submitting this form will result in an error."
            />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input 
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input 
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input 
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input 
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserCreateRequest["role"] })}
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
