# Task 018 — Grading Engine Implementation

**Date:** 2026-10-09
**Branch:** feature/karatu-phase-2
**Baseline commit:** bab77c2

---

## 1. Initial Repository Findings

### Git State
- Working tree: clean at task start
- Latest commit: bab77c2 — feat: complete phase 2 assessments frontend integration

### Existing Grading Infrastructure

#### Domain entities
| File | Status |
|---|---|
| grading/domain/GradingScheme.java | EXISTS |
| grading/domain/GradeBand.java | EXISTS |
| grading/domain/GradingSchemeSourceType.java | EXISTS — GHANA_NACCA_REFERENCE, SCHOOL_CUSTOM |
| assessments/domain/AssessmentPolicy.java | EXISTS — links GradingScheme, passMark, RoundingRule |
| assessments/domain/RoundingRule.java | EXISTS — NONE, NEAREST_WHOLE, ONE_DECIMAL |
| academic/domain/Assessment.java | EXISTS — full model with lifecycle, weight, category |
| academic/domain/AssessmentResult.java | EXISTS — score, scoreStatus, isPass |
| academic/domain/ScoreStatus.java | EXISTS — RECORDED, ABSENT, EXCUSED, MISSING |
| academic/domain/AssessmentLifecycleStatus.java | EXISTS — DRAFT, SUBMITTED, REVIEWED, PUBLISHED, RETURNED |

#### Services
| File | Status |
|---|---|
| grading/service/GradingService.java | EXISTS — determineGradeBand() only |
| grading/service/GradingSchemeManagementService.java | EXISTS — CRUD for schemes |
| assessments/service/AssessmentCalculationService.java | EXISTS — BigDecimal arithmetic |
| assessments/service/AssessmentResultService.java | EXISTS — grade/percentage/weighted fields NULL in response |
| assessments/service/AssessmentLifecycleService.java | EXISTS — missing APPROVED state |

#### Database Migrations
- V13__create_assessment_grading_foundation.sql — grading_schemes, grade_bands, assessment_policies, result_corrections

---

## 2. Gap Analysis

### Critical Gaps

| # | Gap | Severity |
|---|---|---|
| G1 | mapToResponse() returns null for percentage, grade, gradePoint, remark, weightedContribution | CRITICAL |
| G2 | No grade-band CRUD endpoints | HIGH |
| G3 | No grade-band validation (overlaps, gaps, duplicates) | HIGH |
| G4 | AssessmentLifecycleStatus missing APPROVED and LOCKED | HIGH |
| G5 | publish jumps from REVIEWED, skipping APPROVED | HIGH |
| G6 | No AssessmentPolicy API | MEDIUM |
| G7 | No grading scheme copy/template endpoint | MEDIUM |
| G8 | ScoreStatus missing ZERO and WITHDRAWN | MEDIUM |
| G9 | saveResult() always sets RECORDED, ignores isAbsent/isExcused | HIGH |
| G10 | getAllAssessments() uses findAll() then in-memory filter | MEDIUM |
| G11 | No unit tests for grading engine | HIGH |
| G12 | No cross-tenant tests for grading endpoints | HIGH |
| G13 | saveResult() does not block mutation on PUBLISHED assessment | HIGH |
| G14 | DB constraint missing APPROVED and LOCKED lifecycle values | HIGH |

---

## 3. Implementation Plan

- Phase A: Fix score status handling (G9, G13)
- Phase B: Wire grading calculation into result response (G1)
- Phase C: APPROVED + LOCKED lifecycle states (G4, G5, G14)
- Phase D: Grade band CRUD + validation (G2, G3)
- Phase E: Assessment Policy API (G6)
- Phase F: Tests (G11, G12)

---

## 4. Implementation Record

*(Updated as each step completes.)*
