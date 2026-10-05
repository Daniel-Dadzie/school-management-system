package com.karatu.sis.auth.security;

import tools.jackson.databind.ObjectMapper;
import com.karatu.sis.auth.domain.Role;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.dto.LoginRequest;
import com.karatu.sis.auth.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public class SecurityIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private Environment environment;

    private ObjectMapper objectMapper = new ObjectMapper();

    private User testUser;

    @BeforeEach
    void setUp() {
        com.karatu.sis.tenant.TenantContext.setSchoolId(java.util.UUID.fromString("00000000-0000-0000-0000-000000000001"));
        mockMvc = MockMvcBuilders
            .webAppContextSetup(context)
            .apply(SecurityMockMvcConfigurers.springSecurity())
            .build();

        userRepository.deleteAll();
        testUser = new User();
        testUser.setEmail("admin@test.com");
        testUser.setUsername("admin");
        testUser.setPasswordHash(passwordEncoder.encode("supersecret"));
        testUser.setRole(Role.ADMIN);
        testUser.setEnabled(true);
        userRepository.save(testUser);
    }
    
    @AfterEach
    void tearDown() {
        com.karatu.sis.tenant.TenantContext.setSchoolId(java.util.UUID.fromString("00000000-0000-0000-0000-000000000001"));
        userRepository.deleteAll();
        com.karatu.sis.tenant.TenantContext.clear();
    }

    @Test
    void testLoginWithEmail_Success() throws Exception {
       LoginRequest request = new LoginRequest("admin@test.com", "supersecret");

mockMvc.perform(post("/api/v1/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").exists())
        .andExpect(jsonPath("$.refreshToken").doesNotExist())
        .andExpect(cookie().exists("karatu_refresh_token"))
        .andExpect(jsonPath("$.user.username").value("admin"))
        .andExpect(jsonPath("$.user.role").value("ADMIN"))
        .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
        .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    void testLoginWithUsername_Success() throws Exception {
        LoginRequest request = new LoginRequest("admin", "supersecret");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.username").value("admin"));
    }

    @Test
    void testLogin_BadCredentials() throws Exception {
        LoginRequest request = new LoginRequest("admin", "wrongpassword");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void testLogin_UserNotFound_ReturnsGenericError() throws Exception {
        LoginRequest request = new LoginRequest("nonexistent", "password");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void testAccessProtectedRoute_WithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/test/protected"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    void testAccessProtectedRoute_WithValidToken() throws Exception {
        String token = jwtService.generateToken(testUser);

        mockMvc.perform(get("/api/v1/test/protected")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Success"))
                .andExpect(jsonPath("$.role").value("[ROLE_ADMIN]"));
    }

    @Test
    void testAccessProtectedRoute_WithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/v1/test/protected")
                .header("Authorization", "Bearer invalid-token.here"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    void testActuatorHealth_IsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    void testKaratuProductIdentityConfiguration() {
        assertEquals("Karatu SIS", environment.getProperty("spring.application.name"));
        assertEquals("Karatu SIS", environment.getProperty("info.app.name"));
        assertEquals("Karatu SIS", environment.getProperty("karatu.product.name"));
        assertEquals("karatu", environment.getProperty("karatu.product.slug"));
        assertEquals("", environment.getProperty("karatu.product.root-domain"));
    }
}
