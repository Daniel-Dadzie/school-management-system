/* eslint-disable @typescript-eslint/ban-ts-comment */
 
/* eslint-disable react/no-unescaped-entities */
 
// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateStudent } from "@/hooks/use-students";
import { useSchoolClasses } from "@/lib/api/academic";
import { useUsers } from "@/lib/api/users";
import { permissions } from "@/lib/authorization/permissions";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Check, ShieldAlert, HeartPulse, GraduationCap, User } from "lucide-react";

const steps = [
  { id: "personal", label: "Basic Details", icon: User },
  { id: "academic", label: "Academic Info", icon: GraduationCap },
  { id: "guardian", label: "Parent / Guardian", icon: ShieldAlert },
  { id: "medical", label: "Health & Medical", icon: HeartPulse }
];

export default function NewStudentPage() {
  const router = useRouter();
  const create = useCreateStudent();
  const classes = useSchoolClasses();
  const users = useUsers();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({ 
    firstName: "", middleName: "", lastName: "", dateOfBirth: "", gender: "", 
    guardianId: "", currentClassId: "",
    bloodGroup: "", allergies: "", emergencyContactName: "", emergencyContactPhone: ""
  });
  
  const update = (key: keyof typeof data, value: string) => setData((current) => ({ ...current, [key]: value }));
  
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        const student = await create.mutateAsync(data);
        toast.success("Student created successfully.");
        router.push("/students/" + student.id);
      } catch {
        toast.error("Student could not be created. Check the selected guardian and class.");
      }
    }
  };
  
  const parents = users.data?.filter((user) => user.role === "PARENT") ?? [];
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
              <p className="text-sm text-muted-foreground mb-6">Enter the student's legal name and basic demographics.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2"><label className="text-sm font-medium">First name *</label><Input required value={data.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="e.g. John" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Last name *</label><Input required value={data.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="e.g. Doe" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Middle name</label><Input value={data.middleName} onChange={(e) => update("middleName", e.target.value)} placeholder="Optional" /></div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender *</label>
                <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={data.gender} onChange={(e) => update("gender", e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2"><label className="text-sm font-medium">Date of birth *</label><Input required type="date" value={data.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className="w-full sm:w-1/2" /></div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div>
              <h2 className="text-xl font-semibold text-foreground">Academic Placement</h2>
              <p className="text-sm text-muted-foreground mb-6">Assign the student to their starting class and grade.</p>
            </div>
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class Assignment *</label>
                <select required className="flex h-10 w-full sm:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={data.currentClassId} onChange={(e) => update("currentClassId", e.target.value)}>
                  <option value="">Select a class...</option>
                  {classes.data?.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name} (Capacity: {schoolClass.capacity})</option>)}
                </select>
                <p className="text-xs text-muted-foreground mt-2">The student will be automatically enrolled in the active academic term for this class.</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div>
              <h2 className="text-xl font-semibold text-foreground">Parent / Guardian Link</h2>
              <p className="text-sm text-muted-foreground mb-6">Link this student to an existing Parent/Guardian account.</p>
            </div>
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Guardian *</label>
                <select required className="flex h-10 w-full sm:w-2/3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={data.guardianId} onChange={(e) => update("guardianId", e.target.value)}>
                  <option value="">Search or select a parent...</option>
                  {parents.map((parent) => <option key={parent.id} value={parent.id}>{parent.firstName} {parent.lastName} ({parent.email})</option>)}
                </select>
                <p className="text-xs text-muted-foreground mt-2">Note: To add a new parent, you must first create them in Global Users.</p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div>
              <h2 className="text-xl font-semibold text-foreground">Health & Medical Profile (Optional)</h2>
              <p className="text-sm text-muted-foreground mb-6">Enter essential medical information and emergency contacts.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Blood Group</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={data.bloodGroup} onChange={(e) => update("bloodGroup", e.target.value)}>
                  <option value="">Unknown</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">Emergency Contact Name</label><Input value={data.emergencyContactName} onChange={(e) => update("emergencyContactName", e.target.value)} placeholder="e.g. Jane Doe" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Emergency Contact Phone</label><Input value={data.emergencyContactPhone} onChange={(e) => update("emergencyContactPhone", e.target.value)} placeholder="e.g. +233 55 123 4567" /></div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Known Allergies / Medical Conditions</label>
                <Textarea value={data.allergies} onChange={(e) => update("allergies", e.target.value)} placeholder="List any known allergies, chronic conditions, or required daily medications..." className="min-h-[100px]" />
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <PageShell title="Add Student" description="Create a student profile and initial enrollment." breadcrumbs={[{ label: "Students", href: "/students" }, { label: "New Student" }]} permission={permissions.studentsManage}>
      <Card className="max-w-4xl mx-auto shadow-sm border-t-4 border-t-primary">
        <CardHeader className="bg-muted/20 pb-8 border-b">
          <div className="flex justify-between items-center mb-8">
            <div>
              <CardTitle className="text-2xl">Student Onboarding Wizard</CardTitle>
              <CardDescription className="mt-1">Complete all steps to provision the student profile.</CardDescription>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-primary">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-xs text-muted-foreground">{steps[currentStep].label}</span>
            </div>
          </div>
          
          <div className="relative pt-4">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
            
            <div className="relative flex justify-between z-10">
              {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${isCompleted ? 'bg-primary text-primary-foreground shadow-md' : isCurrent ? 'bg-background border-2 border-primary text-primary ring-4 ring-primary/10 scale-110' : 'bg-background border-2 border-muted text-muted-foreground'}`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-semibold hidden md:block ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-8 pb-6 px-6 sm:px-10">
          {(classes.isError || users.isError) && <p role="alert" className="mb-6 p-4 rounded-md bg-destructive/10 text-sm font-medium text-destructive border border-destructive/20">System Error: Could not load required dropdown data. Please refresh.</p>}
          <form onSubmit={submit}>
            <div className="min-h-[320px]">
              {renderStep()}
            </div>
            
            <div className="pt-8 flex justify-between items-center border-t mt-8">
              <Button type="button" variant="outline" onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : router.back()} className="w-32">
                {currentStep > 0 ? <><ArrowLeft className="w-4 h-4 mr-2" /> Back</> : "Cancel"}
              </Button>
              
              <Button type="submit" className="w-40" disabled={create.isPending || classes.isLoading || users.isLoading}>
                {currentStep < steps.length - 1 ? (
                  <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                ) : (
                  <>
                    {create.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {create.isPending ? "Saving..." : "Create Student"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}