"use client";

import { UserCreateRequest, useCreateUser } from "@/lib/api/users";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    middleName: "",
    preferredName: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    teacherProfile: { staffId: "", qualification: "", specialization: "", employmentDate: "" },
  });

  const mutation = useCreateUser();
  // Successful creation is handled by the domain mutation hook.
  const handleSuccess = (createdUser: { id: string | number }) => {
      toast.success("User created successfully.");
      router.push(`/users/${createdUser.id}`);
  };
  const handleError = (err: Error) => {
      // We expect this to fail right now as the backend isn't implemented.
      toast.error(err?.message || "Failed to create user. Please try again.");
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="middleName" className="text-sm font-medium">Middle name</label><Input id="middleName" value={formData.middleName} onChange={(e) => setFormData({ ...formData, middleName: e.target.value })} /></div>
            <div className="space-y-2"><label htmlFor="preferredName" className="text-sm font-medium">Preferred name</label><Input id="preferredName" value={formData.preferredName} onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="gender" className="text-sm font-medium">Gender</label><Input id="gender" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} /></div>
            <div className="space-y-2"><label htmlFor="dateOfBirth" className="text-sm font-medium">Date of birth</label><Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="phone" className="text-sm font-medium">Phone</label><Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
            <div className="space-y-2"><label htmlFor="address" className="text-sm font-medium">Address</label><Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
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
              {useAuthStore.getState().user?.role === "SUPER_ADMIN" && <><option value="SUPER_ADMIN">Super Admin</option><option value="ADMIN">Admin</option></>}
              <option value="TEACHER">Teacher</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>

          {formData.role === "TEACHER" && <section className="space-y-4 rounded-md border p-4">
            <h3 className="font-semibold">Teacher information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><label htmlFor="staffId" className="text-sm font-medium">Staff ID</label><Input id="staffId" required value={formData.teacherProfile?.staffId} onChange={(e) => setFormData({ ...formData, teacherProfile: { ...formData.teacherProfile!, staffId: e.target.value } })} /></div>
              <div className="space-y-2"><label htmlFor="qualification" className="text-sm font-medium">Qualification</label><Input id="qualification" value={formData.teacherProfile?.qualification} onChange={(e) => setFormData({ ...formData, teacherProfile: { ...formData.teacherProfile!, qualification: e.target.value } })} /></div>
              <div className="space-y-2"><label htmlFor="specialization" className="text-sm font-medium">Specialization</label><Input id="specialization" value={formData.teacherProfile?.specialization} onChange={(e) => setFormData({ ...formData, teacherProfile: { ...formData.teacherProfile!, specialization: e.target.value } })} /></div>
              <div className="space-y-2"><label htmlFor="employmentDate" className="text-sm font-medium">Employment date</label><Input id="employmentDate" type="date" value={formData.teacherProfile?.employmentDate} onChange={(e) => setFormData({ ...formData, teacherProfile: { ...formData.teacherProfile!, employmentDate: e.target.value } })} /></div>
            </div>
          </section>}

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mutation.isPending ? "Creating..." : "Create user"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
