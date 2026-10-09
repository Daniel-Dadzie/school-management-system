# Assessments & Grading — Competitive Research & Alignment Report

## A. Executive Summary

Karatu SIS's Assessments & Grading architecture was reviewed against leading global and emerging-market School Information Systems (PowerSchool, Gradelink, openSIS, Fedena, and standard Ghanaian practices). The core structural decisions in Karatu's `ASSESSMENT_SOURCE_OF_TRUTH.md` (authoritative backend calculations, configurable weightings, and explicit state lifecycles) hold up strongly against industry standards. However, the initial specification had gaps around edge-case student statuses (withdrawn/dropped), advanced grading methodologies (competency-based grading, extra credit), and calculation precision constraints. This document details the research findings and the resulting updates to the assessment specifications to ensure Karatu is production-ready for diverse SaaS tenants.

## B. Competitive Research Summary

*   **PowerSchool (Global Standard)**: Uses a highly customizable gradebook with support for both traditional numeric calculation and standards-based/competency-based grading. Explicitly handles "Excused", "Missing", and "Late" with configurable penalty or zero-fill rules. Retains records for withdrawn students without skewing active class averages.
*   **Gradelink**: Known for an intuitive teacher interface. Allows easy toggling between letter grades, percentages, and standard/narrative marks. Strong support for "Extra Credit" which can be applied at the assignment or category level.
*   **openSIS (Open Source Base)**: Uses rigid mathematical rounding rules. Distinguishes heavily between assignments that are "Ungraded" vs. "0". 
*   **Fedena & Local African Contexts**: Heavily reliant on end-of-term examinations mixed with Continuous Assessment (SBA in Ghana). Calculations are often mandated by national curriculum (e.g., NaCCA in Ghana dictates 30% SBA, 70% Exam), requiring SIS implementations in these regions to support template-driven grading schemes that default to national standards while still allowing private schools to deviate.

## C. The 20-Point Comparison Matrix

| Feature | Industry Standard (PowerSchool/Fedena) | Karatu Intended Approach | Alignment Status |
| :--- | :--- | :--- | :--- |
| **1. Assessment hierarchy** | Term -> Category -> Assessment -> Component | Academic Year -> Term -> Section -> Subject -> Teacher -> Category | **Aligned** (Karatu is context-heavy) |
| **2. Weighting models** | Configurable (Flat or Category) | Configurable by school policy | **Aligned** |
| **3. Missing vs Zero** | Missing != Zero; Configurable zero-fill | Missing != Zero (Explicit states) | **Aligned** |
| **4. Calculation rounding** | Round Half Up typically default | Not explicitly defined previously | **Gap Fixed** (Set to Round Half Up) |
| **5. Grading schemes** | Configurable grade bands | Configurable grade bands | **Aligned** |
| **6. Multiple grading schemes** | Yes (e.g., K-3 vs High School) | Yes, by academic context | **Aligned** |
| **7. Competency-based grading** | Supported extensively | Numeric focus in initial docs | **Gap Fixed** (Added qualitative support) |
| **8. Assessment lifecycle** | Draft -> Published | Draft -> Submitted -> Approved -> Published | **Aligned** (Karatu is more robust) |
| **9. Result locking** | Yes (Term locks) | Yes (Locked state) | **Aligned** |
| **10. Audit trails** | Yes, track changes | Yes, required for mutations | **Aligned** |
| **11. Correction workflows** | Post-publication requests | Authorized Correction Workflow | **Aligned** |
| **12. Historical integrity** | Snapshots or versioning | Strict versioning required | **Aligned** |
| **13. Teacher view UX** | Spreadsheet entry | Bulk score entry | **Aligned** |
| **14. Extra credit** | Yes, component or category level | Not mentioned | **Gap Fixed** (Explicitly supported) |
| **15. Parent visibility** | Real-time or Post-publication | Post-publication only | **Aligned** (Karatu focuses on verified data) |
| **16. Ranking rules** | Configurable (Class, Year) | Configurable | **Aligned** |
| **17. Term integration** | Yes | Yes | **Aligned** |
| **18. Report generation** | Integrated but separate | Separate Reporting domain | **Aligned** (Architectural separation) |
| **19. Dropped mid-term students** | Preserved but excluded | Not mentioned | **Gap Fixed** (Added WITHDRAWN state) |
| **20. Configurable policies** | Highly configurable | Highly configurable | **Aligned** |

## D. Karatu's Intended Product Differentiation

While Karatu supports standard grading mechanics, its differentiation lies in:
1.  **Strict Lifecycle Authorization**: Unlike some lightweight SIS tools where teachers can infinitely edit grades, Karatu enforces a strict `Draft -> Submitted -> Approved -> Published` workflow, ensuring that printed report cards always match the system's authoritative state.
2.  **Architectural Separation**: Karatu intentionally isolates the "Assessment Calculation" from the "Report Generation". Assessments generate factual, immutable results. Reports simply present them. This prevents the common SIS bug where changing a report template accidentally alters historical GPAs.
3.  **Ghana-First, Not Ghana-Locked**: Karatu defaults to NaCCA (Ghana) templates (e.g., 30/70 SBA/Exam weighting) but implements them as configurable policies, preventing the system from becoming hard-coded to a single national standard.

## E. Identified Specification Gaps

The audit against industry standards revealed the following gaps in Karatu's initial `ASSESSMENT_SOURCE_OF_TRUTH.md`:
1.  **No Competency/Standards-Based Grading**: The specification assumed numeric calculations resulting in grade bands. Modern schools require qualitative assessments (e.g., Exceeds Expectations).
2.  **Missing "Withdrawn" State**: The documentation handled "Absent" and "Excused", but lacked a state for students who drop the class mid-term.
3.  **Ambiguous Rounding Rules**: Deterministic calculations require explicit rounding strategies.
4.  **No Extra Credit Concept**: Schools often need the ability to award points that exceed the maximum denominator.

## F. Assessment Requirements to Preserve

The following core rules from Karatu's architecture are validated by this research and **must be preserved** without change:
*   The Backend API is the absolute authority on calculation. The frontend must not independently calculate percentages or grade bands.
*   Tenant isolation (`school_id`) must be strictly enforced on all assessment entities.
*   A blank score (`NOT_ENTERED`) must never implicitly evaluate as `0`.
*   Published results cannot be silently overwritten (Correction workflow is mandatory).

## G. Required Specification Updates

To address the gaps identified in Section E, the following concepts needed to be formally defined in the architecture:
*   Add `WITHDRAWN` to the list of explicit learner states.
*   Define the default rounding calculation as `RoundingMode.HALF_UP`.
*   Introduce the concept of `Extra Credit` within the calculation pipeline.
*   Add explicit support for `Competency and Standards-Based Grading` bypassing traditional numeric aggregation.

## H. Updates Made to `ASSESSMENT_SOURCE_OF_TRUTH.md`

The following modifications were made to `docs/architecture/ASSESSMENT_SOURCE_OF_TRUTH.md`:
1.  **Section 8**: Updated title to "Missing, Zero, Absent, Excused and Withdrawn". Added `WITHDRAWN` state and rules for preserving historical data while excluding from current averages.
2.  **Section 10**: Added explicit instruction for `Round Half Up` rounding rules. Added a subsection for `Extra Credit` supporting scores exceeding the denominator.
3.  **Section 11**: Added a subsection for `Competency and Standards-Based Grading`, providing qualitative configuration examples (4 -> Exceeds Expectations).

## I. Implementation Sequence Recommendation

Based on the research and updated architectural rules, the Assessments & Grading domain should be implemented in the following sequence to minimize risk:

**Phase 1: Foundation & Policy (Backend)**
*   Implement `AssessmentCategory`, `AssessmentPurpose`, and `GradingScheme` entities and CRUD endpoints.
*   Ensure tenant isolation and validation rules are strictly applied.

**Phase 2: The Assessment Record (Backend)**
*   Implement `Assessment` and `AssessmentResult` entities.
*   Implement the state tracking (`NOT_ENTERED`, `SCORED`, `ZERO`, `ABSENT`, `EXCUSED`, `WITHDRAWN`).
*   Wire up the `teacher_assignment_id` constraint correctly (as discovered in the prior audit).

**Phase 3: The Calculation Engine (Backend)**
*   Implement the deterministic calculation service (using `BigDecimal` and `HALF_UP` rounding).
*   Implement standard numeric weighting and introduce competency-based passthrough logic.
*   Write exhaustive unit tests for edge cases (zero-fill, extra credit, missing components).

**Phase 4: The Workflow & Authorization (Backend)**
*   Implement the `Draft -> Submitted -> Approved -> Published` state machine.
*   Implement the `ResultCorrection` entity and audit logging.

**Phase 5: Frontend Integration**
*   Replace the mock logic in `assessment-adapter.ts` with real API calls.
*   Implement the bulk-entry (spreadsheet-style) teacher UI.
*   Ensure the frontend respects read-only states for published results.

## J. Next Steps

1.  Review and approve the updated `ASSESSMENT_SOURCE_OF_TRUTH.md` and this alignment report.
2.  Review and approve the new `FEATURE_RESEARCH_AND_DECISION_PROTOCOL.md`.
3.  Proceed to **Phase 1** of the implementation sequence when ready.
