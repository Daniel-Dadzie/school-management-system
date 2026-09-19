package com.schoolmanagement.people.repository;

import com.schoolmanagement.people.domain.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByAdmissionNumber(String admissionNumber);
    boolean existsByAdmissionNumber(String admissionNumber);
}

