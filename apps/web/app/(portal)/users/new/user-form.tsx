"use client";

import { UserCreateRequest, useCreateUser } from "@/lib/api/users";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";

const steps = ["Personal Info", "Contact Details", "Role & Assignment"];

export function UserForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
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
  const handleSuccess = (createdUser: { id: string | number }) => {
      toast.success("User created successfully.");
      router.push(`/users/${createdUser.id}`);
  };
  const handleError = (err: Error) => {
      toast.error(err?.message || "Failed to create user. Please try again.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      mutation.mutate(formData, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name *</label>
                <Input required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name *</label>
                <Input required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><label className="text-sm font-medium">Middle Name</label><Input value={formData.middleName} onChange={(e) => setFormData({ ...formData, middleName: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Preferred Name</label><Input value={formData.preferredName} onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><label className="text-sm font-medium">Gender</label><Input value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Date of Birth</label><Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} /></div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><label className="text-sm font-medium">Phone</label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Address</label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address *</label>
              <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username *</label>
              <Input required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <label className="text-sm font-medium">System Role *</label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserCreateRequest["role"] })}
              >
                {useAuthStore.getState().user?.role === "IT_ADMIN" && <option value="ADMIN">Admin</option>}
                <option value="TEACHER">Teacher</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>

            {formData.role === "TEACHER" && (
              <div className="space-y-4 rounded-md border bg-slate-50 p-4 dark:bg-slate-900 mt-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Teacher Professional Info</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><label className="text-sm font-medium">Staff ID *</label><Input required value={formData.teacherProfile?.staffId} onChange={(e) => setFormData({ ...formData, teacherProfile: { ...formData.teacherProfile!, staffId: e.target.value } })} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Qualification</label><Input value={formData.teacherProfile?.qualification} onChange={(e) => setFormData({ ...formData, teacherProfile: { ...formData.teacherProfile!, qualification: e.target.value } })} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Specialization</label><Input value={formData.teacherProfile?.specialization} onChange={(e) => setFormData({ ...formData, teacherProfile: { ...formData.teacherProfile!, specialization: e.target.value } })} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Employment Date</label><Input type="date" value={formData.teacherProfile?.employmentDate} onChange={(e) => setFormData({ ...formData, teacherProfile: { ...formData.teacherProfile!, employmentDate: e.target.value } })} /></div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-lg border-t-4 border-t-primary">
      <CardHeader className="bg-muted/30 pb-8 border-b">
        <div className="flex justify-between items-center mb-6">
          <CardTitle className="text-2xl">Create New User</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
        </div>
        
        {/* Progress Tracker */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
          <div className="relative flex justify-between">
            {steps.map((label, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              return (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${isCompleted ? 'bg-primary text-primary-foreground' : isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'}`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8 pb-6">
        <form onSubmit={handleSubmit}>
          
          <div className="min-h-[250px]">
            {renderStep()}
          </div>

          <div className="pt-8 flex justify-between items-center border-t mt-8">
            {currentStep > 0 ? (
              <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
            )}
            
            <Button type="submit" disabled={mutation.isPending}>
              {currentStep < steps.length - 1 ? (
                <>Next Step <ArrowRight className="w-4 h-4 ml-2" /></>
              ) : (
                <>
                  {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mutation.isPending ? "Creating..." : "Complete Setup"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
