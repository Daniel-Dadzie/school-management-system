package com.karatu.sis.auth.service;

import com.karatu.sis.auth.domain.Role;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PlatformAdminBootstrapTest {

    private final UserRepository users = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final ApplicationArguments args = mock(ApplicationArguments.class);

    @Test
    void createsGlobalSuperAdminWithEncodedPasswordAndForcedRotation() {
        when(users.findByEmail("owner@example.test")).thenReturn(Optional.empty());
        when(users.findByUsername("platform-owner")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("temporary-password" )).thenReturn("bcrypt-hash");
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        new PlatformAdminBootstrap(users, passwordEncoder, "OWNER@example.test", "platform-owner", "temporary-password")
                .run(args);

        verify(users).save(argThat(user -> user.getRole() == Role.SUPER_ADMIN
                && user.getSchoolId() == null
                && user.isPasswordChangeRequired()
                && "bcrypt-hash".equals(user.getPasswordHash())));
    }

    @Test
    void rerunDoesNotChangeExistingMatchingPlatformAdmin() {
        User existing = new User();
        existing.setId(UUID.randomUUID());
        existing.setRole(Role.SUPER_ADMIN);
        existing.setEmail("owner@example.test");
        existing.setUsername("platform-owner");
        when(users.findByEmail("owner@example.test")).thenReturn(Optional.of(existing));
        when(users.findByUsername("platform-owner")).thenReturn(Optional.of(existing));

        new PlatformAdminBootstrap(users, passwordEncoder, "owner@example.test", "platform-owner", "new-temporary-password")
                .run(args);

        verify(users, never()).save(any());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void partialCredentialsFailClosed() {
        PlatformAdminBootstrap bootstrap = new PlatformAdminBootstrap(users, passwordEncoder, "owner@example.test", "", "");
        assertThrows(IllegalStateException.class, () -> bootstrap.run(args));
        verifyNoInteractions(users, passwordEncoder);
    }
}
