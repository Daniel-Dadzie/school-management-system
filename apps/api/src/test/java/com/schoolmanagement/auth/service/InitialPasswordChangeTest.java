package com.schoolmanagement.auth.service;

import com.schoolmanagement.auth.domain.Role;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.dto.ChangePasswordRequest;
import com.schoolmanagement.auth.repository.UserRepository;
import com.schoolmanagement.auth.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InitialPasswordChangeTest {

    private final UserRepository users = mock(UserRepository.class);
    private final PasswordEncoder encoder = mock(PasswordEncoder.class);
    private final AuthService authService = new AuthService(
            mock(AuthenticationManager.class), mock(JwtService.class), mock(RefreshTokenService.class), users, encoder);

    @Test
    void successfulChangeHashesPasswordAndClearsEnforcementFlag() {
        User user = new User();
        user.setRole(Role.SUPER_ADMIN);
        user.setPasswordHash("initial-hash");
        user.setPasswordChangeRequired(true);
        when(encoder.matches("temporary-password", "initial-hash")).thenReturn(true);
        when(encoder.encode("new-password-123")).thenReturn("new-hash");

        authService.changeInitialPassword(user, new ChangePasswordRequest("temporary-password", "new-password-123"));

        assertEquals("new-hash", user.getPasswordHash());
        assertFalse(user.isPasswordChangeRequired());
        verify(users).save(user);
    }

    @Test
    void rejectsWrongInitialPassword() {
        User user = new User();
        user.setPasswordHash("initial-hash");
        user.setPasswordChangeRequired(true);
        when(encoder.matches(any(), any())).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.changeInitialPassword(
                user, new ChangePasswordRequest("wrong-password", "new-password-123")));
        verify(users, never()).save(any());
    }
}
