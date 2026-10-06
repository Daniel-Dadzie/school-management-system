package com.karatu.sis.people.repository;

import java.util.Optional;

import com.karatu.sis.people.domain.AdmissionApplication;
import com.karatu.sis.people.domain.AdmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AdmissionApplicationRepository extends JpaRepository<AdmissionApplication, UUID> {
    List<AdmissionApplication> findAllBySchoolId(UUID schoolId);
    List<AdmissionApplication> findByStatusAndSchoolId(AdmissionStatus status, UUID schoolId);
    List<AdmissionApplication> findByParentEmailAndSchoolId(String parentEmail, UUID schoolId);
    Optional<AdmissionApplication> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
