package com.karatu.sis.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_management_audit_logs")
public class UserManagementAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @Column(name = "actor_user_id", nullable = false, updatable = false)
    private UUID actorUserId;

    @Column(name = "target_user_id", nullable = false, updatable = false)
    private UUID targetUserId;

    @Column(nullable = false, length = 40, updatable = false)
    private String action;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected UserManagementAuditLog() {}

    public UserManagementAuditLog(UUID schoolId, UUID actorUserId, UUID targetUserId, String action) {
        this.schoolId = schoolId;
        this.actorUserId = actorUserId;
        this.targetUserId = targetUserId;
        this.action = action;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getSchoolId() { return schoolId; }
    public UUID getActorUserId() { return actorUserId; }
    public UUID getTargetUserId() { return targetUserId; }
    public String getAction() { return action; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
