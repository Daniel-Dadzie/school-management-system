package com.karatu.sis.academic.repository;

import java.util.Optional;

import com.karatu.sis.academic.domain.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    List<Subject> findAllBySchoolId(UUID schoolId);
    Optional<Subject> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
