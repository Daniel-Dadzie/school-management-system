import { z } from "zod";

export const reportTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  isActive: z.boolean().default(true),
  config: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Config must be valid JSON" }),
});

export type ReportTemplateFormData = z.infer<typeof reportTemplateSchema>;
