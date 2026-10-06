package com.karatu.sis.reporting.repository;

import com.karatu.sis.reporting.domain.ReportSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportSnapshotRepository extends JpaRepository<ReportSnapshot, UUID> {
    Optional<ReportSnapshot> findByIdAndSchoolId(UUID id, UUID schoolId);
    List<ReportSnapshot> findBySchoolIdAndTermId(UUID schoolId, UUID termId);
    List<ReportSnapshot> findBySchoolIdAndStudentId(UUID schoolId, UUID studentId);
    Optional<ReportSnapshot> findBySchoolIdAndStudentIdAndTermIdAndTemplateId(UUID schoolId, UUID studentId, UUID termId, UUID templateId);
    
    // Fetch by class context
    List<ReportSnapshot> findBySchoolIdAndAcademicYearIdAndTermIdAndEnrollmentSchoolClassId(UUID schoolId, UUID academicYearId, UUID termId, UUID classId);
    
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
}
