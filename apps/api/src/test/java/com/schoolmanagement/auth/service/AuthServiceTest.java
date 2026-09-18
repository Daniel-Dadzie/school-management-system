package com.schoolmanagement.auth.service;

import com.schoolmanagement.auth.domain.Role;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.dto.AuthResponse;
import com.schoolmanagement.auth.dto.LoginRequest;
import com.schoolmanagement.auth.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User activeUser;

    @BeforeEach
    void setUp() {
        activeUser = new User();
        activeUser.setId(UUID.randomUUID());
        activeUser.setEmail("teacher@school.com");
        activeUser.setUsername("teacher");
        activeUser.setPasswordHash("hashed_password");
        activeUser.setRole(Role.TEACHER);
        activeUser.setEnabled(true);
    }

    @Test
    void testAuthenticate_Success() {
        LoginRequest request = new LoginRequest("teacher", "password");
        Authentication auth = new UsernamePasswordAuthenticationToken(activeUser, null, activeUser.getAuthorities());
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtService.generateToken(activeUser)).thenReturn("fake-jwt-token");

        AuthResponse response = authService.authenticate(request);

        assertNotNull(response);
        assertEquals("fake-jwt-token", response.token());
        assertEquals("teacher", response.user().username());
        assertEquals(Role.TEACHER, response.user().role());
        assertNotNull(response.user().id());
        // Verify hash is absent
        assertFalse(response.toString().contains("hashed_password"));
    }

    @Test
    void testAuthenticate_DisabledAccount() {
        activeUser.setEnabled(false);
        LoginRequest request = new LoginRequest("teacher", "password");
        Authentication auth = new UsernamePasswordAuthenticationToken(activeUser, null, activeUser.getAuthorities());
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);

        BadCredentialsException exception = assertThrows(BadCredentialsException.class, () -> {
            authService.authenticate(request);
        });

        assertEquals("Invalid credentials", exception.getMessage()); // Error message is generic
    }

    @Test
    void testAuthenticate_InvalidCredentials() {
        LoginRequest request = new LoginRequest("teacher", "wrongpassword");
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Bad credentials from provider"));

        BadCredentialsException exception = assertThrows(BadCredentialsException.class, () -> {
            authService.authenticate(request);
        });

        assertEquals("Invalid credentials", exception.getMessage());
    }
}

