package com.karatu.sis.people.repository;

import com.karatu.sis.people.domain.ParentStudent;
import com.karatu.sis.people.domain.ParentStudentId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ParentStudentRepository extends JpaRepository<ParentStudent, ParentStudentId> {
    List<ParentStudent> findById_ParentId(UUID parentId);
    List<ParentStudent> findById_StudentId(UUID studentId);
}

