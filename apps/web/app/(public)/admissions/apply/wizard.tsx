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
  
  enrollmentClass: z.string().min(1, "Enrollment class is required"),
  previousSchool: z.string().optional(),
  
  guardianFirstName: z.string().min(1, "Guardian first name is required"),
  guardianLastName: z.string().min(1, "Guardian last name is required"),
  guardianEmail: z.string().email("Invalid email address"),
  guardianPhone: z.string().min(1, "Phone number is required"),
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
      enrollmentClass: "",
      previousSchool: "",
      guardianFirstName: "",
      guardianLastName: "",
      guardianEmail: "",
      guardianPhone: "",
    },
  });

  const formData = watch();

  const submitMutation = useMutation({
    mutationFn: async (data: WizardData) => {
      // API payload structure expectation for POST /api/v1/admissions
      // We map the flat form data to the likely expected DTO structure.
      const payload = {
        student: {
          firstName: data.studentFirstName,
          lastName: data.studentLastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
        },
        academic: {
          enrollmentClass: data.enrollmentClass,
          previousSchool: data.previousSchool,
        },
        guardian: {
          firstName: data.guardianFirstName,
          lastName: data.guardianLastName,
          email: data.guardianEmail,
          phone: data.guardianPhone,
        }
      };
      
      // We pass requiresAuth: false since this is a public form
      return apiClient("/admissions", {
        method: "POST",
        body: JSON.stringify(payload),
        requiresAuth: false,
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Application submitted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof WizardData)[] = [];
    if (step === 1) {
      fieldsToValidate = ["studentFirstName", "studentLastName", "dateOfBirth", "gender"];
    } else if (step === 2) {
      fieldsToValidate = ["enrollmentClass"];
    } else if (step === 3) {
      fieldsToValidate = ["guardianFirstName", "guardianLastName", "guardianEmail", "guardianPhone"];
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
                <Label htmlFor="enrollmentClass">Enrollment Class</Label>
                <Select 
                  onValueChange={(value) => setValue("enrollmentClass", value)} 
                  defaultValue={formData.enrollmentClass}
                >
                  <SelectTrigger className={errors.enrollmentClass ? "border-destructive" : ""}>
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
                {errors.enrollmentClass && <p className="text-xs text-destructive">{errors.enrollmentClass.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="previousSchool">Previous School (Optional)</Label>
                <Input 
                  id="previousSchool" 
                  {...register("previousSchool")} 
                  placeholder="Leave blank if not applicable"
                />
              </div>
            </div>

            {/* Step 3: Guardian Details */}
            <div className={step === 3 ? "block space-y-4" : "hidden"}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianFirstName">Guardian First Name</Label>
                  <Input 
                    id="guardianFirstName" 
                    {...register("guardianFirstName")} 
                    className={errors.guardianFirstName ? "border-destructive" : ""} 
                  />
                  {errors.guardianFirstName && <p className="text-xs text-destructive">{errors.guardianFirstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianLastName">Guardian Last Name</Label>
                  <Input 
                    id="guardianLastName" 
                    {...register("guardianLastName")} 
                    className={errors.guardianLastName ? "border-destructive" : ""} 
                  />
                  {errors.guardianLastName && <p className="text-xs text-destructive">{errors.guardianLastName.message}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">Email Address</Label>
                  <Input 
                    id="guardianEmail" 
                    type="email"
                    {...register("guardianEmail")} 
                    className={errors.guardianEmail ? "border-destructive" : ""} 
                  />
                  {errors.guardianEmail && <p className="text-xs text-destructive">{errors.guardianEmail.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Phone Number</Label>
                  <Input 
                    id="guardianPhone" 
                    type="tel"
                    {...register("guardianPhone")} 
                    className={errors.guardianPhone ? "border-destructive" : ""} 
                  />
                  {errors.guardianPhone && <p className="text-xs text-destructive">{errors.guardianPhone.message}</p>}
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
                  <span className="text-muted-foreground">Class:</span>
                  <span className="font-medium text-foreground">{formData.enrollmentClass}</span>
                  <span className="text-muted-foreground">Previous School:</span>
                  <span className="font-medium text-foreground">{formData.previousSchool || "N/A"}</span>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-muted/20">
                <h4 className="text-sm font-semibold mb-3 border-b pb-2">Guardian Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-foreground">{formData.guardianFirstName} {formData.guardianLastName}</span>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{formData.guardianEmail}</span>
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium text-foreground">{formData.guardianPhone}</span>
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
