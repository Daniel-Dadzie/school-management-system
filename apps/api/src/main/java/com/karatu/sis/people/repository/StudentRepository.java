package com.karatu.sis.people.repository;

import com.karatu.sis.people.domain.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByAdmissionNumberAndSchoolId(String admissionNumber, UUID schoolId);
    boolean existsByAdmissionNumberAndSchoolId(String admissionNumber, UUID schoolId);
}
