package com.karatu.sis.tenant;

import com.karatu.sis.common.exception.UnauthorizedResourceAccessException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TenantContextTest {
    @AfterEach
    void clearContext() {
        TenantContext.clear();
    }

    @Test
    void requiresTenantForSchoolData() {
        assertThatThrownBy(TenantContext::requireSchoolId)
                .isInstanceOf(UnauthorizedResourceAccessException.class);
    }

    @Test
    void rejectsResourceOwnedByAnotherSchool() {
        UUID currentSchool = UUID.randomUUID();
        TenantContext.setSchoolId(currentSchool);

        assertThat(TenantContext.requireSchoolId()).isEqualTo(currentSchool);
        assertThatThrownBy(() -> TenantContext.assertSchool(UUID.randomUUID()))
                .isInstanceOf(UnauthorizedResourceAccessException.class);
    }
}
