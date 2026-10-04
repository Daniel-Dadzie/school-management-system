package com.schoolmanagement.auth.repository;

import com.schoolmanagement.auth.domain.UserManagementAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserManagementAuditLogRepository extends JpaRepository<UserManagementAuditLog, UUID> {}
