package com.schoolmanagement.people.repository;

import com.schoolmanagement.people.domain.AdmissionApplication;
import com.schoolmanagement.people.domain.AdmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AdmissionApplicationRepository extends JpaRepository<AdmissionApplication, UUID> {
    List<AdmissionApplication> findByStatus(AdmissionStatus status);
    List<AdmissionApplication> findByParentEmail(String parentEmail);
}

