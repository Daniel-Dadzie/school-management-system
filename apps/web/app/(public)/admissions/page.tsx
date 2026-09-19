"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Zod schema — mirrors backend Bean Validation constraints exactly
// ---------------------------------------------------------------------------
const admissionSchema = z.object({
  studentFirstName: z
    .string()
    .min(1, "Student first name is required")
    .max(100, "Must not exceed 100 characters"),

  studentLastName: z
    .string()
    .min(1, "Student last name is required")
    .max(100, "Must not exceed 100 characters"),

  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date < new Date();
    }, "Date of birth must be a valid past date"),

  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Please select a valid gender"
  }),

  applyingForClass: z
    .string()
    .min(1, "Class to apply for is required")
    .max(100, "Must not exceed 100 characters"),

  parentName: z
    .string()
    .min(1, "Parent/guardian name is required")
    .max(200, "Must not exceed 200 characters"),

  parentEmail: z
    .string()
    .min(1, "Parent email is required")
    .email("Must be a valid email address")
    .max(255, "Must not exceed 255 characters"),

  parentPhone: z
    .string()
    .min(1, "Parent phone number is required")
    .max(20, "Must not exceed 20 characters"),

  relationship: z.enum(["MOTHER", "FATHER", "GUARDIAN", "OTHER"], {
    message: "Please select a valid relationship"
  }),

  additionalNotes: z
    .string()
    .max(2000, "Must not exceed 2000 characters")
    .optional(),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

// ---------------------------------------------------------------------------
// API base URL — reads from Next.js env
// ---------------------------------------------------------------------------
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Strip trailing /api/v1 if the env var already includes it, then always append it
// This makes the component work whether NEXT_PUBLIC_API_URL is the root or includes /api/v1
 
// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function AdmissionsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
  });

  const onSubmit = async (data: AdmissionFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/admissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          additionalNotes: data.additionalNotes ?? null,
        }),
      });

      if (response.status === 201) {
        setSubmitted(true);
        reset();
      } else if (response.status === 400) {
        const body = await response.json();
        const firstError = body?.details
          ? Object.values(body.details as Record<string, string>)[0]
          : "Please check your form and try again.";
        setServerError(firstError ?? "Please check your form and try again.");
      } else {
        setServerError(
          "An unexpected error occurred. Please try again later."
        );
      }
    } catch {
      setServerError(
        "Unable to reach the server. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Success state
  // ---------------------------------------------------------------------------
  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Application Submitted
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Thank you for applying to CarePoint. Your application has been
            received and is under review. We will contact you at the email
            address you provided.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 text-sm text-blue-600 hover:underline"
          >
            Submit another application
          </button>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admission Application
          </h1>
          <p className="mt-2 text-gray-600">
            Complete the form below to apply for admission to CarePoint
            Community School. All fields marked with{" "}
            <span className="text-red-500">*</span> are required.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100"
        >
          {/* ---------------------------------------------------------------- */}
          {/* Section 1 — Student Details */}
          {/* ---------------------------------------------------------------- */}
          <section className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Student Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="First Name"
                required
                error={errors.studentFirstName?.message}
              >
                <input
                  {...register("studentFirstName")}
                  type="text"
                  placeholder="e.g. Kofi"
                  className={inputCls(!!errors.studentFirstName)}
                />
              </Field>

              <Field
                label="Last Name"
                required
                error={errors.studentLastName?.message}
              >
                <input
                  {...register("studentLastName")}
                  type="text"
                  placeholder="e.g. Mensah"
                  className={inputCls(!!errors.studentLastName)}
                />
              </Field>

              <Field
                label="Date of Birth"
                required
                error={errors.dateOfBirth?.message}
              >
                <input
                  {...register("dateOfBirth")}
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  className={inputCls(!!errors.dateOfBirth)}
                />
              </Field>

              <Field label="Gender" required error={errors.gender?.message}>
                <select
                  {...register("gender")}
                  className={inputCls(!!errors.gender)}
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>

              <Field
                label="Applying For Class"
                required
                error={errors.applyingForClass?.message}
                className="sm:col-span-2"
              >
                <input
                  {...register("applyingForClass")}
                  type="text"
                  placeholder="e.g. JSS 1, Primary 4"
                  className={inputCls(!!errors.applyingForClass)}
                />
              </Field>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Section 2 — Parent/Guardian Details */}
          {/* ---------------------------------------------------------------- */}
          <section className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Parent / Guardian Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="Full Name"
                required
                error={errors.parentName?.message}
                className="sm:col-span-2"
              >
                <input
                  {...register("parentName")}
                  type="text"
                  placeholder="e.g. Ama Mensah"
                  className={inputCls(!!errors.parentName)}
                />
              </Field>

              <Field
                label="Email Address"
                required
                error={errors.parentEmail?.message}
              >
                <input
                  {...register("parentEmail")}
                  type="email"
                  placeholder="e.g. ama.mensah@example.com"
                  className={inputCls(!!errors.parentEmail)}
                />
              </Field>

              <Field
                label="Phone Number"
                required
                error={errors.parentPhone?.message}
              >
                <input
                  {...register("parentPhone")}
                  type="tel"
                  placeholder="e.g. 0241234567"
                  className={inputCls(!!errors.parentPhone)}
                />
              </Field>

              <Field
                label="Relationship to Student"
                required
                error={errors.relationship?.message}
                className="sm:col-span-2"
              >
                <select
                  {...register("relationship")}
                  className={inputCls(!!errors.relationship)}
                >
                  <option value="">Select relationship</option>
                  <option value="MOTHER">Mother</option>
                  <option value="FATHER">Father</option>
                  <option value="GUARDIAN">Guardian</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Section 3 — Additional Notes */}
          {/* ---------------------------------------------------------------- */}
          <section className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Additional Information
            </h2>
            <Field
              label="Additional Notes"
              error={errors.additionalNotes?.message}
            >
              <textarea
                {...register("additionalNotes")}
                rows={4}
                placeholder="Any additional information you would like to share..."
                className={inputCls(!!errors.additionalNotes)}
              />
            </Field>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Submit */}
          {/* ---------------------------------------------------------------- */}
          <div className="p-8">
            {serverError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Submitting…" : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function inputCls(hasError: boolean) {
  return [
    "block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
    hasError
      ? "border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 bg-white",
  ].join(" ");
}

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function Field({ label, required, error, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
