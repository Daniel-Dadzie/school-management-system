package com.karatu.sis.people.repository;

import com.karatu.sis.people.domain.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TeacherRepository extends JpaRepository<Teacher, UUID> {
    Optional<Teacher> findByUser_IdAndSchoolId(UUID userId, UUID schoolId);
    boolean existsByStaffNumberAndSchoolId(String staffNumber, UUID schoolId);
    Optional<Teacher> findByIdAndSchoolId(UUID id, UUID schoolId);
    boolean existsByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
