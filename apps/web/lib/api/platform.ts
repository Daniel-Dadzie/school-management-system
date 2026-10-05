import { z } from "zod";
import { apiClient } from "@/lib/api/client";

const platformSchoolSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  active: z.boolean(),
  createdAt: z.string(),
});

const platformSchoolsSchema = z.array(platformSchoolSchema);

export type PlatformSchool = z.infer<typeof platformSchoolSchema>;

export interface ProvisionPlatformSchoolRequest {
  name: string;
  slug: string;
  email: string;
  phone: string;
  timezone: string;
  administratorUsername: string;
  administratorEmail: string;
  temporaryPassword: string;
}

export async function getPlatformSchools(): Promise<PlatformSchool[]> {
  const response = await apiClient<unknown>("/platform/schools");
  return platformSchoolsSchema.parse(response);
}

export async function provisionPlatformSchool(
  request: ProvisionPlatformSchoolRequest,
): Promise<PlatformSchool> {
  const response = await apiClient<unknown>("/platform/schools", {
    method: "POST",
    body: JSON.stringify(request),
  });
  return platformSchoolSchema.parse(response);
}
