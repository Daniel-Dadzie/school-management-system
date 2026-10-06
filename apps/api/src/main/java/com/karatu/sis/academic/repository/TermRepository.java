package com.karatu.sis.academic.repository;

import java.util.Optional;

import com.karatu.sis.academic.domain.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TermRepository extends JpaRepository<Term, UUID> {
    List<Term> findByAcademicYearIdAndSchoolId(UUID academicYearId, UUID schoolId);
    Optional<Term> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
