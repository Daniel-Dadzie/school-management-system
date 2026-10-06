export interface ReportTemplateRecord {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  config: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportTemplateCreateRequest {
  name: string;
  description?: string;
  isActive: boolean;
  config: string;
}

export interface ReportTemplateUpdateRequest {
  name: string;
  description?: string;
  isActive: boolean;
  config: string;
}

export interface ReportGenerationRequest {
  academicYearId: string;
  termId: string;
  classId: string;
  templateId: string;
}

