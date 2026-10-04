package com.schoolmanagement.tenant.domain;

import com.schoolmanagement.tenant.TenantContext;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PostLoad;

import java.util.UUID;

@MappedSuperclass
public abstract class SchoolOwnedEntity {
    @Column(name = "school_id", nullable = false, updatable = false)
    private UUID schoolId;

    @PrePersist
    protected void assignSchool() {
        UUID currentSchoolId = TenantContext.requireSchoolId();
        if (schoolId != null && !schoolId.equals(currentSchoolId)) {
            TenantContext.assertSchool(schoolId);
        }
        schoolId = currentSchoolId;
    }

    @PostLoad
    protected void verifySchoolOwnership() {
        TenantContext.assertSchool(schoolId);
    }

    public UUID getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(UUID schoolId) {
        this.schoolId = schoolId;
    }
}
