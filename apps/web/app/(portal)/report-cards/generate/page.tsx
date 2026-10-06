"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssessmentReferences } from "@/hooks/use-assessments";
import { useReportTemplates, useGenerateReports } from "@/hooks/use-reporting";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  academicYearId: z.string().min(1, "Academic Year is required"),
  termId: z.string().min(1, "Term is required"),
  classId: z.string().min(1, "Class is required"),
  templateId: z.string().min(1, "Template is required"),
});

export default function GenerateReportsPage() {

  const { data: references, isLoading: isLoadingReferences } = useAssessmentReferences();
  const { data: templates, isLoading: isLoadingTemplates } = useReportTemplates();
  const generateReports = useGenerateReports();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      academicYearId: "",
      termId: "",
      classId: "",
      templateId: "",
    },
  });

  const selectedYearId = form.watch("academicYearId");
  
  // Filter terms by selected academic year
  const filteredTerms = references?.terms.filter(t => t.academicYearId === selectedYearId) || [];

  function onSubmit(values: z.infer<typeof formSchema>) {
    generateReports.mutate(values, {
      onSuccess: () => {
        toast("Reports Generation Started", {
          description: "Report snapshot generation has been initiated for the class.",
        });
        // reset form if needed
        form.reset();
      },
      onError: (error) => {
        toast.error("Generation Failed", {
          description: error instanceof Error ? error.message : "An error occurred",
        });
      }
    });
  }

  if (isLoadingReferences || isLoadingTemplates) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeTemplates = templates?.filter(t => t.isActive) || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-6">
      <div>
        <h3 className="text-lg font-medium">Generate Report Cards</h3>
        <p className="text-sm text-muted-foreground">
          Bulk generate report cards for an entire class based on published assessment results.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generation Criteria</CardTitle>
          <CardDescription>Select the target context and template.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="academicYearId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Year</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {references?.academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="termId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        defaultValue={field.value}
                        disabled={!selectedYearId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredTerms.map((term) => (
                            <SelectItem key={term.id} value={term.id}>
                              {term.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {references?.classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Template</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                        {activeTemplates.length === 0 && (
                          <SelectItem value="none" disabled>
                            No active templates available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The design and layout configuration to use.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={generateReports.isPending}>
                  {generateReports.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Reports
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
