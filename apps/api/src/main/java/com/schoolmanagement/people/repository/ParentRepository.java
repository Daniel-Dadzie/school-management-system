package com.schoolmanagement.people.repository;

import com.schoolmanagement.people.domain.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ParentRepository extends JpaRepository<Parent, UUID> {
    Optional<Parent> findByUser_Id(UUID userId);
}

