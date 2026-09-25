/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";

const wizardSchema = z.object({
  studentFirstName: z.string().min(1, "First name is required"),
  studentLastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),

  applyingForClass: z.string().min(1, "Class is required"),

  parentName: z.string().min(1, "Parent/Guardian name is required"),
  parentEmail: z.string().email("Invalid email address"),
  parentPhone: z.string().min(1, "Phone number is required"),
  relationship: z.string().min(1, "Relationship is required"),

  additionalNotes: z.string().optional(),
});

type WizardData = z.infer<typeof wizardSchema>;

const STEPS = [
  { id: 1, name: "Student Details" },
  { id: 2, name: "Academic Info" },
  { id: 3, name: "Guardian Details" },
  { id: 4, name: "Review & Submit" },
];

export function AdmissionWizard() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<WizardData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      studentFirstName: "",
      studentLastName: "",
      dateOfBirth: "",
      gender: "",
      applyingForClass: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      relationship: "",
      additionalNotes: "",
    },
  });

  const formData = watch();

  const submitMutation = useMutation({
    mutationFn: async (data: WizardData) => {
      return apiClient("/admissions", {
        method: "POST",
        body: JSON.stringify(data),
        requiresAuth: false,
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Application submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof WizardData)[] = [];
    if (step === 1) {
      fieldsToValidate = ["studentFirstName", "studentLastName", "dateOfBirth", "gender"];
    } else if (step === 2) {
      fieldsToValidate = ["applyingForClass"];
    } else if (step === 3) {
      fieldsToValidate = ["parentName", "parentEmail", "parentPhone", "relationship"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    setStep((s) => s - 1);
  };

  const onSubmit = (data: WizardData) => {
    submitMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <Card className="text-center py-12 px-6 shadow-sm">
        <CardContent className="space-y-4 flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-success/20 text-success flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Application Received</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you for applying to CarePoint Community School. We have received your application and our admissions team will be in touch with you shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Stepper */}
      <div className="mb-8 hidden sm:flex justify-between relative before:absolute before:inset-0 before:top-1/2 before:block before:h-0.5 before:-translate-y-1/2 before:rounded-full before:bg-muted before:z-0">
        {STEPS.map((s) => {
          const isActive = step === s.id;
          const isPast = step > s.id;

          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center bg-background px-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors ${
                isActive ? "border-primary bg-primary text-primary-foreground" :
                isPast ? "border-primary bg-primary text-primary-foreground" :
                "border-muted bg-background text-muted-foreground"
              }`}>
                {isPast ? <CheckCircle2 className="h-4 w-4" /> : s.id}
              </div>
              <span className={`mt-2 text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {s.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="mb-6 sm:hidden text-center">
        <span className="text-sm font-medium text-primary">
          Step {step} of 4: {STEPS[step - 1].name}
        </span>
      </div>

      <Card className="shadow-xs border">
        <CardHeader>
          <CardTitle>{STEPS[step - 1].name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="wizard-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Student Details */}
            <div className={step === 1 ? "block space-y-4" : "hidden"}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentFirstName">First Name</Label>
                  <Input
                    id="studentFirstName"
                    {...register("studentFirstName")}
                    className={errors.studentFirstName ? "border-destructive" : ""}
                  />
                  {errors.studentFirstName && <p className="text-xs text-destructive">{errors.studentFirstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentLastName">Last Name</Label>
                  <Input
                    id="studentLastName"
                    {...register("studentLastName")}
                    className={errors.studentLastName ? "border-destructive" : ""}
                  />
                  {errors.studentLastName && <p className="text-xs text-destructive">{errors.studentLastName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className={errors.dateOfBirth ? "border-destructive" : ""}
                  />
                  {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    onValueChange={(value) => setValue("gender", value)}
                    defaultValue={formData.gender}
                  >
                    <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
                </div>
              </div>
            </div>

            {/* Step 2: Academic Info */}
            <div className={step === 2 ? "block space-y-4" : "hidden"}>
              <div className="space-y-2">
                <Label htmlFor="applyingForClass">Applying For Class</Label>
                <Select
                  onValueChange={(value) => setValue("applyingForClass", value)}
                  defaultValue={formData.applyingForClass}
                >
                  <SelectTrigger className={errors.applyingForClass ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NURSERY_1">Nursery 1</SelectItem>
                    <SelectItem value="NURSERY_2">Nursery 2</SelectItem>
                    <SelectItem value="KG_1">Kindergarten 1</SelectItem>
                    <SelectItem value="KG_2">Kindergarten 2</SelectItem>
                    <SelectItem value="CLASS_1">Class 1</SelectItem>
                    <SelectItem value="CLASS_2">Class 2</SelectItem>
                    <SelectItem value="CLASS_3">Class 3</SelectItem>
                    <SelectItem value="CLASS_4">Class 4</SelectItem>
                    <SelectItem value="CLASS_5">Class 5</SelectItem>
                    <SelectItem value="CLASS_6">Class 6</SelectItem>
                    <SelectItem value="JHS_1">JHS 1</SelectItem>
                    <SelectItem value="JHS_2">JHS 2</SelectItem>
                    <SelectItem value="JHS_3">JHS 3</SelectItem>
                  </SelectContent>
                </Select>
                {errors.applyingForClass && <p className="text-xs text-destructive">{errors.applyingForClass.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                <Input
                  id="additionalNotes"
                  {...register("additionalNotes")}
                  placeholder="Any additional information"
                />
              </div>
            </div>

            {/* Step 3: Guardian Details */}
            <div className={step === 3 ? "block space-y-4" : "hidden"}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Parent/Guardian Full Name</Label>
                  <Input
                    id="parentName"
                    {...register("parentName")}
                    className={errors.parentName ? "border-destructive" : ""}
                  />
                  {errors.parentName && <p className="text-xs text-destructive">{errors.parentName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship to Student</Label>
                  <Select
                    onValueChange={(value) => setValue("relationship", value)}
                    defaultValue={formData.relationship}
                  >
                    <SelectTrigger className={errors.relationship ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOTHER">Mother</SelectItem>
                      <SelectItem value="FATHER">Father</SelectItem>
                      <SelectItem value="GUARDIAN">Guardian</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.relationship && <p className="text-xs text-destructive">{errors.relationship.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Email Address</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    {...register("parentEmail")}
                    className={errors.parentEmail ? "border-destructive" : ""}
                  />
                  {errors.parentEmail && <p className="text-xs text-destructive">{errors.parentEmail.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Phone Number</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    {...register("parentPhone")}
                    className={errors.parentPhone ? "border-destructive" : ""}
                  />
                  {errors.parentPhone && <p className="text-xs text-destructive">{errors.parentPhone.message}</p>}
                </div>
              </div>
            </div>

            {/* Step 4: Review */}
            <div className={step === 4 ? "block space-y-6" : "hidden"}>
              <div className="rounded-lg border p-4 bg-muted/20">
                <h4 className="text-sm font-semibold mb-3 border-b pb-2">Student Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-foreground">{formData.studentFirstName} {formData.studentLastName}</span>
                  <span className="text-muted-foreground">DOB:</span>
                  <span className="font-medium text-foreground">{formData.dateOfBirth}</span>
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium text-foreground">{formData.gender}</span>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-muted/20">
                <h4 className="text-sm font-semibold mb-3 border-b pb-2">Academic Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Applying for:</span>
                  <span className="font-medium text-foreground">{formData.applyingForClass}</span>
                  <span className="text-muted-foreground">Additional Notes:</span>
                  <span className="font-medium text-foreground">{formData.additionalNotes || "N/A"}</span>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-muted/20">
                <h4 className="text-sm font-semibold mb-3 border-b pb-2">Guardian Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-foreground">{formData.parentName}</span>
                  <span className="text-muted-foreground">Relationship:</span>
                  <span className="font-medium text-foreground">{formData.relationship}</span>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{formData.parentEmail}</span>
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium text-foreground">{formData.parentPhone}</span>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 1 || submitMutation.isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {step < 4 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              form="wizard-form"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
