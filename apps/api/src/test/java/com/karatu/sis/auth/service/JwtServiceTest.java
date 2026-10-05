package com.karatu.sis.auth.service;

import io.jsonwebtoken.Claims;
import com.karatu.sis.auth.domain.Role;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "test-secret-must-be-long-enough-for-hs256-12345678901234567890");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hour
        ReflectionTestUtils.setField(jwtService, "jwtIssuer", "karatu-sis");

        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("admin@school.com");
        user.setUsername("admin");
        user.setPasswordHash("hashed_password");
        user.setRole(Role.ADMIN);
    }

    @Test
    void testGenerateTokenAndValidate() {
        String token = jwtService.generateToken(user);
        assertNotNull(token);

        String username = jwtService.extractUsername(token);
        assertEquals("admin", username);
        assertEquals("karatu-sis", jwtService.extractClaim(token, Claims::getIssuer));

        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void testTokenValidationFailsForDifferentUser() {
        String token = jwtService.generateToken(user);

        User otherUser = new User();
        otherUser.setUsername("differentUser");

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void testMalformedToken() {
        assertThrows(Exception.class, () -> jwtService.extractUsername("malformed.token.here"));
    }
}

