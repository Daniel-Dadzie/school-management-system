package com.schoolmanagement.people.repository;

import com.schoolmanagement.people.domain.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TeacherRepository extends JpaRepository<Teacher, UUID> {
    Optional<Teacher> findByUser_Id(UUID userId);
    boolean existsByStaffNumber(String staffNumber);
}

