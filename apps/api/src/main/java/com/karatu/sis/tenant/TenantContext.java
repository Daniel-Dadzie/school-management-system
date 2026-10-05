package com.karatu.sis.tenant;

import com.karatu.sis.common.exception.UnauthorizedResourceAccessException;
import com.karatu.sis.tenant.domain.SchoolOwnedEntity;

import java.util.UUID;

/** Request-scoped school identity established from the authenticated user. */
public final class TenantContext {
    private static final ThreadLocal<UUID> SCHOOL_ID = new ThreadLocal<>();

    private TenantContext() {}

    public static void setSchoolId(UUID schoolId) {
        SCHOOL_ID.set(schoolId);
    }

    public static UUID currentSchoolId() {
        return SCHOOL_ID.get();
    }

    public static UUID requireSchoolId() {
        UUID schoolId = SCHOOL_ID.get();
        if (schoolId == null) {
            throw new UnauthorizedResourceAccessException("A school account is required for this operation");
        }
        return schoolId;
    }

    public static void assertSchool(UUID schoolId) {
        if (schoolId == null || !requireSchoolId().equals(schoolId)) {
            throw new UnauthorizedResourceAccessException("Resource is not available to this school");
        }
    }

    public static void assertOwnership(SchoolOwnedEntity entity) {
        assertSchool(entity.getSchoolId());
    }

    public static void clear() {
        SCHOOL_ID.remove();
    }
}
