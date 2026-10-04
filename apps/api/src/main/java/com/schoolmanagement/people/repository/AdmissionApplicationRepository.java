package com.schoolmanagement.people.repository;

import com.schoolmanagement.people.domain.AdmissionApplication;
import com.schoolmanagement.people.domain.AdmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AdmissionApplicationRepository extends JpaRepository<AdmissionApplication, UUID> {
    List<AdmissionApplication> findAllBySchoolId(UUID schoolId);
    List<AdmissionApplication> findByStatusAndSchoolId(AdmissionStatus status, UUID schoolId);
    List<AdmissionApplication> findByParentEmailAndSchoolId(String parentEmail, UUID schoolId);
}
