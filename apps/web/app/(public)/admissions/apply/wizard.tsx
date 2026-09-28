"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/lib/api/errors";
import { useSubmitAdmissionApplication } from "@/lib/api/admissions";

const wizardSchema = z.object({
  studentFirstName: z.string().trim().min(1, "First name is required"),
  studentLastName: z.string().trim().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),

  enrollmentClass: z.string().min(1, "Enrollment class is required"),
  previousSchool: z.string().trim().optional(),

  guardianFirstName: z.string().trim().min(1, "Guardian first name is required"),
  guardianLastName: z.string().trim().min(1, "Guardian last name is required"),
  guardianEmail: z.string().trim().email("Invalid email address"),
  guardianPhone: z.string().trim().min(1, "Phone number is required"),
});

type WizardData = z.infer<typeof wizardSchema>;

const STEPS = [
  { id: 1, name: "Student Details" },
  { id: 2, name: "Academic Info" },
  { id: 3, name: "Guardian Details" },
  { id: 4, name: "Review & Submit" },
] as const;

const STEP_FIELDS: Record<number, (keyof WizardData)[]> = {
  1: [
    "studentFirstName",
    "studentLastName",
    "dateOfBirth",
    "gender",
  ],
  2: ["enrollmentClass"],
  3: [
    "guardianFirstName",
    "guardianLastName",
    "guardianEmail",
    "guardianPhone",
  ],
};

export function AdmissionWizard() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const submitApplication = useSubmitAdmissionApplication();

  const {
    register,
    handleSubmit,
    setValue,
    control,
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

  const formData = useWatch({ control });

  const submitMutation = useMutation({
    mutationFn: async (data: WizardData) => {
      return submitApplication.mutateAsync({
        studentFirstName: data.studentFirstName,
        studentLastName: data.studentLastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        applyingForClass: data.enrollmentClass,
        parentName: `${data.guardianFirstName} ${data.guardianLastName}`,
        parentEmail: data.guardianEmail,
        parentPhone: data.guardianPhone,
        relationship: "GUARDIAN",
        additionalNotes: data.previousSchool?.trim()
          ? `Previous school: ${data.previousSchool.trim()}`
          : undefined,
      });
    },

    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Application submitted successfully");
    },

    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
        return;
      }

      toast.error("Failed to submit application. Please try again.");
    },
  });

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[step];

    if (!fieldsToValidate) {
      return;
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setStep((currentStep) => Math.min(currentStep + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setStep((currentStep) => Math.max(currentStep - 1, 1));
  };

  const handleSelectChange = (
    field: "gender" | "enrollmentClass",
    value: string,
  ) => {
    setValue(field, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onSubmit = (data: WizardData) => {
    submitMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <Card className="px-6 py-12 text-center shadow-sm">
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold text-foreground">
            Application Received
          </h2>

          <p className="mx-auto max-w-md text-muted-foreground">
            Thank you for applying to CarePoint Community School. We have
            received your application and our admissions team will be in touch
            with you shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="relative mb-8 hidden justify-between sm:flex before:absolute before:inset-0 before:top-1/2 before:z-0 before:block before:h-0.5 before:-translate-y-1/2 before:rounded-full before:bg-muted">
        {STEPS.map((currentStep) => {
          const isActive = step === currentStep.id;
          const isPast = step > currentStep.id;

          return (
            <div
              key={currentStep.id}
              className="relative z-10 flex flex-col items-center bg-background px-2"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors ${
                  isActive || isPast
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-background text-muted-foreground"
                }`}
              >
                {isPast ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  currentStep.id
                )}
              </div>

              <span
                className={`mt-2 text-xs font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {currentStep.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile step indicator */}
      <div className="mb-6 text-center sm:hidden">
        <span className="text-sm font-medium text-primary">
          Step {step} of {STEPS.length}: {STEPS[step - 1].name}
        </span>
      </div>

      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle>{STEPS[step - 1].name}</CardTitle>
        </CardHeader>

        <CardContent>
          <form id="wizard-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Student Details */}
            <div className={step === 1 ? "block space-y-4" : "hidden"}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="studentFirstName">First Name</Label>
                  <Input
                    id="studentFirstName"
                    {...register("studentFirstName")}
                    className={
                      errors.studentFirstName ? "border-destructive" : ""
                    }
                    aria-invalid={Boolean(errors.studentFirstName)}
                  />
                  {errors.studentFirstName && (
                    <p className="text-xs text-destructive">
                      {errors.studentFirstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentLastName">Last Name</Label>
                  <Input
                    id="studentLastName"
                    {...register("studentLastName")}
                    className={
                      errors.studentLastName ? "border-destructive" : ""
                    }
                    aria-invalid={Boolean(errors.studentLastName)}
                  />
                  {errors.studentLastName && (
                    <p className="text-xs text-destructive">
                      {errors.studentLastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className={errors.dateOfBirth ? "border-destructive" : ""}
                    aria-invalid={Boolean(errors.dateOfBirth)}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-destructive">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>

                  <Select
                    value={formData.gender ?? ""}
                    onValueChange={(value) =>
                      handleSelectChange("gender", value)
                    }
                  >
                    <SelectTrigger
                      id="gender"
                      className={errors.gender ? "border-destructive" : ""}
                      aria-invalid={Boolean(errors.gender)}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>

                  {errors.gender && (
                    <p className="text-xs text-destructive">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Academic Information */}
            <div className={step === 2 ? "block space-y-4" : "hidden"}>
              <div className="space-y-2">
                <Label htmlFor="enrollmentClass">Enrollment Class</Label>

                <Select
                  value={formData.enrollmentClass ?? ""}
                  onValueChange={(value) =>
                    handleSelectChange("enrollmentClass", value)
                  }
                >
                  <SelectTrigger
                    id="enrollmentClass"
                    className={
                      errors.enrollmentClass ? "border-destructive" : ""
                    }
                    aria-invalid={Boolean(errors.enrollmentClass)}
                  >
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

                {errors.enrollmentClass && (
                  <p className="text-xs text-destructive">
                    {errors.enrollmentClass.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousSchool">
                  Previous School (Optional)
                </Label>

                <Input
                  id="previousSchool"
                  {...register("previousSchool")}
                  placeholder="Leave blank if not applicable"
                />
              </div>
            </div>

            {/* Step 3: Guardian Details */}
            <div className={step === 3 ? "block space-y-4" : "hidden"}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianFirstName">
                    Guardian First Name
                  </Label>

                  <Input
                    id="guardianFirstName"
                    {...register("guardianFirstName")}
                    className={
                      errors.guardianFirstName ? "border-destructive" : ""
                    }
                    aria-invalid={Boolean(errors.guardianFirstName)}
                  />

                  {errors.guardianFirstName && (
                    <p className="text-xs text-destructive">
                      {errors.guardianFirstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianLastName">
                    Guardian Last Name
                  </Label>

                  <Input
                    id="guardianLastName"
                    {...register("guardianLastName")}
                    className={
                      errors.guardianLastName ? "border-destructive" : ""
                    }
                    aria-invalid={Boolean(errors.guardianLastName)}
                  />

                  {errors.guardianLastName && (
                    <p className="text-xs text-destructive">
                      {errors.guardianLastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">Email Address</Label>

                  <Input
                    id="guardianEmail"
                    type="email"
                    {...register("guardianEmail")}
                    className={
                      errors.guardianEmail ? "border-destructive" : ""
                    }
                    aria-invalid={Boolean(errors.guardianEmail)}
                  />

                  {errors.guardianEmail && (
                    <p className="text-xs text-destructive">
                      {errors.guardianEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Phone Number</Label>

                  <Input
                    id="guardianPhone"
                    type="tel"
                    {...register("guardianPhone")}
                    className={
                      errors.guardianPhone ? "border-destructive" : ""
                    }
                    aria-invalid={Boolean(errors.guardianPhone)}
                  />

                  {errors.guardianPhone && (
                    <p className="text-xs text-destructive">
                      {errors.guardianPhone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 4: Review */}
            <div className={step === 4 ? "block space-y-6" : "hidden"}>
              <div className="rounded-lg border bg-muted/20 p-4">
                <h4 className="mb-3 border-b pb-2 text-sm font-semibold">
                  Student Information
                </h4>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-foreground">
                    {formData.studentFirstName} {formData.studentLastName}
                  </span>

                  <span className="text-muted-foreground">DOB:</span>
                  <span className="font-medium text-foreground">
                    {formData.dateOfBirth}
                  </span>

                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium text-foreground">
                    {formData.gender}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4">
                <h4 className="mb-3 border-b pb-2 text-sm font-semibold">
                  Academic Information
                </h4>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Class:</span>
                  <span className="font-medium text-foreground">
                    {formData.enrollmentClass}
                  </span>

                  <span className="text-muted-foreground">
                    Previous School:
                  </span>
                  <span className="font-medium text-foreground">
                    {formData.previousSchool || "N/A"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4">
                <h4 className="mb-3 border-b pb-2 text-sm font-semibold">
                  Guardian Information
                </h4>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-foreground">
                    {formData.guardianFirstName} {formData.guardianLastName}
                  </span>

                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">
                    {formData.guardianEmail}
                  </span>

                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium text-foreground">
                    {formData.guardianPhone}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-muted/10 p-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 1 || submitMutation.isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < STEPS.length ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={submitMutation.isPending}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              form="wizard-form"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending
                ? "Submitting..."
                : "Submit Application"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

