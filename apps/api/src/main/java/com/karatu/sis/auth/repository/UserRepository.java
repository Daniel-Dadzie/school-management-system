package com.karatu.sis.auth.repository;

import com.karatu.sis.auth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);
    boolean existsByUsernameIgnoreCaseAndIdNot(String username, UUID id);
    List<User> findAllBySchoolIdOrderByCreatedAtDesc(UUID schoolId);
    Optional<User> findByIdAndSchoolId(UUID id, UUID schoolId);
}
