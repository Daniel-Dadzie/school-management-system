package com.karatu.sis.auth.repository;

import com.karatu.sis.auth.domain.UserManagementAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserManagementAuditLogRepository extends JpaRepository<UserManagementAuditLog, UUID> {}
