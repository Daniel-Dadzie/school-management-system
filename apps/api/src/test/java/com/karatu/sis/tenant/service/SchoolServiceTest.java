package com.karatu.sis.tenant.service;

import com.karatu.sis.auth.domain.Role;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.repository.UserRepository;
import com.karatu.sis.tenant.domain.School;
import com.karatu.sis.tenant.dto.SchoolCreateRequest;
import com.karatu.sis.tenant.repository.SchoolRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SchoolServiceTest {
    @Test
    void provisioningCreatesSchoolScopedItAdmin() {
        SchoolRepository schoolRepository = mock(SchoolRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        UUID schoolId = UUID.randomUUID();
        when(schoolRepository.existsBySlug("example-school")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("admin@example.com")).thenReturn(false);
        when(userRepository.existsByUsernameIgnoreCase("schoolit")).thenReturn(false);
        when(schoolRepository.saveAndFlush(any(School.class))).thenAnswer(invocation -> {
            School school = invocation.getArgument(0);
            school.setId(schoolId);
            return school;
        });
        when(passwordEncoder.encode("temporary-password")).thenReturn("hashed-password");

        SchoolService service = new SchoolService(schoolRepository, userRepository, passwordEncoder);
        service.provision(new SchoolCreateRequest("Example School", "example-school", null, null,
                null, null, null, null, "admin@example.com", "schoolit", "temporary-password"));

        ArgumentCaptor<User> createdUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(createdUser.capture());
        assertEquals(Role.IT_ADMIN, createdUser.getValue().getRole());
        assertEquals(schoolId, createdUser.getValue().getSchoolId());
        assertEquals("hashed-password", createdUser.getValue().getPasswordHash());
    }
}
