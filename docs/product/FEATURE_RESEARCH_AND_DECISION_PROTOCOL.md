# Karatu Feature Research & Decision Protocol

## 1. Purpose

This protocol defines the standardized process for researching, evaluating, and specifying features in Karatu SIS before implementation begins. Because Karatu is a multi-tenant, shared-hosted SaaS, product and architectural decisions must be carefully weighed against industry standards to ensure they are robust, scalable, and appropriate for diverse school environments.

This protocol prevents "implementation by assumption" and ensures that every major domain is validated against real-world educational use cases.

## 2. When to Use This Protocol

This protocol must be executed before beginning implementation (or significant refactoring) of any major domain or complex feature in Karatu, including but not limited to:

*   Assessments & Grading
*   Academic Operations (Timetabling, Enrollments, Rollover)
*   Finance & Billing
*   Reporting & Transcripts
*   Attendance Management
*   Communication & Notifications
*   Admissions & Enrollment
*   Behavior & Disciplinary Tracking

## 3. The Research Process

### Phase 1: Competitive & Industry Analysis
Before writing or finalizing specifications, research how established School Management Systems (SIS/SMS) handle the domain.
*   **Target Systems (Global)**: PowerSchool, Gradelink, openSIS, Infinite Campus, Skyward.
*   **Target Systems (Emerging Markets / Africa)**: Fedena, local Ghanaian/African platforms (e.g., various local proprietary systems).
*   **Objective**: Understand the standard baseline, common configuration options, and edge cases.

### Phase 2: Domain Contextualization (The Karatu Way)
Evaluate the research against Karatu's specific product principles (defined in `KARATU_PRODUCT_PRINCIPLES.md`):
*   **Multi-Tenancy**: How does this feature work when multiple schools share the same database?
*   **Configurability vs. Convention**: What should be a global default (Ghana-aligned) vs. a tenant-specific configuration?
*   **Data Authority**: Where does the business logic live? (Backend is authoritative).
*   **Historical Integrity**: How do we prevent changes in configuration from corrupting past records?

### Phase 3: The 20-Point (or N-Point) Matrix
Construct a comparison matrix mapping specific functional requirements against industry standards and Karatu's intended approach. This ensures no edge cases (e.g., dropped students, rounding rules, missing vs. zero) are overlooked.

### Phase 4: Gap Analysis & Specification Update
Compare Karatu's existing Source of Truth (SOT) documents against the research findings.
*   Identify missing concepts (e.g., competency-based grading, mid-term enrollments).
*   Update the relevant authoritative SOT documents in `docs/architecture/`.
*   *Do not duplicate information.* If a rule belongs in `ASSESSMENT_SOURCE_OF_TRUTH.md`, update it there rather than creating a new file.

## 4. Required Output Artifact

The research phase must produce a standardized alignment document (e.g., `docs/alignment/feature_name_research.md` or a comprehensive artifact) containing:

1.  **Executive Summary**: High-level findings.
2.  **Competitive Research Summary**: How competitors handle the domain.
3.  **Comparison Matrix**: Specific feature points compared.
4.  **Karatu's Differentiation**: How and why Karatu's approach differs (if it does).
5.  **Identified Specification Gaps**: What was missing from the initial SOT.
6.  **Requirements to Preserve**: Existing rules that are validated and must not change.
7.  **Updates Made**: Explicit list of changes made to authoritative documents.
8.  **Recommended Implementation Sequence**: A safe, phased approach to building the feature.

## 5. Architectural & Product Guardrails

During research and decision-making, adhere to these non-negotiable rules:
*   **Backend Supremacy**: The backend API and database own all business rules, calculations, and state transitions. The frontend is a presentation layer.
*   **No Silently Overwriting History**: Published records (results, invoices, reports) must be immutable or versioned.
*   **Tenant Isolation**: All data must be strongly scoped to the tenant (`school_id`).
*   **Configurability**: Do not hardcode school-specific policies (like a specific grading table) into the application logic. Use configurations and defaults.
