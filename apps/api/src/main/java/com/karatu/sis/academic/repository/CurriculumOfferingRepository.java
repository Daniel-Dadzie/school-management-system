package com.karatu.sis.academic.repository;

import com.karatu.sis.academic.domain.CurriculumOffering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CurriculumOfferingRepository extends JpaRepository<CurriculumOffering, UUID> {
    List<CurriculumOffering> findAllBySchoolIdAndAcademicYearIdAndGradeLevel(UUID schoolId, UUID academicYearId, String gradeLevel);
    
    List<CurriculumOffering> findAllBySchoolIdAndAcademicYearId(UUID schoolId, UUID academicYearId);
    
    Optional<CurriculumOffering> findByIdAndSchoolId(UUID id, UUID schoolId);
    
    boolean existsBySchoolIdAndAcademicYearIdAndGradeLevelAndSubjectId(UUID schoolId, UUID academicYearId, String gradeLevel, UUID subjectId);
}
