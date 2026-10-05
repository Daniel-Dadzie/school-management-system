package com.karatu.sis.auth.controller;

import tools.jackson.databind.ObjectMapper;
import com.karatu.sis.auth.domain.Role;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.repository.UserManagementAuditLogRepository;
import com.karatu.sis.auth.repository.RefreshTokenRepository;
import com.karatu.sis.auth.repository.UserRepository;
import com.karatu.sis.auth.security.JwtService;
import com.karatu.sis.auth.service.RefreshTokenService;
import com.karatu.sis.tenant.TenantContext;
import com.karatu.sis.tenant.domain.School;
import com.karatu.sis.tenant.repository.SchoolRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
class SchoolUserControllerIntegrationTest {
    private static final UUID CAREPOINT_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final String USERS_PATH = "/api/v1/schools/current/users";

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired WebApplicationContext context;
    @Autowired UserRepository userRepository;
    @Autowired UserManagementAuditLogRepository auditRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;
    @Autowired RefreshTokenService refreshTokenService;
    @Autowired SchoolRepository schoolRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;
    @Autowired ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private User itAdmin;
    private String itAdminToken;
    private UUID otherSchoolId;
    private UUID otherSchoolUserId;

    @BeforeEach
    void setUp() {
        TenantContext.setSchoolId(CAREPOINT_ID);
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        auditRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        School otherSchool = new School();
        otherSchool.setSlug("other-" + UUID.randomUUID().toString().substring(0, 8));
        otherSchool.setName("Other School");
        otherSchool = schoolRepository.saveAndFlush(otherSchool);
        otherSchoolId = otherSchool.getId();

        itAdmin = saveUser(CAREPOINT_ID, "itadmin", Role.IT_ADMIN);
        itAdminToken = jwtService.generateToken(itAdmin);
        User otherSchoolUser = saveUser(otherSchoolId, "otheradmin", Role.ADMIN);
        otherSchoolUserId = otherSchoolUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.setSchoolId(CAREPOINT_ID);
        auditRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        TenantContext.clear();
    }

    @Test
    void itAdminCanCreateAndListSchoolUsersWithoutExposingPassword() throws Exception {
        String body = """
                {"email":"teacher@example.com","username":"teacher1","password":"temporary-password","role":"TEACHER"}
                """;

        mockMvc.perform(post(USERS_PATH)
                        .header("Authorization", bearer(itAdminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("TEACHER"))
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        mockMvc.perform(get(USERS_PATH).header("Authorization", bearer(itAdminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.username == 'itadmin')]").exists())
                .andExpect(jsonPath("$[?(@.username == 'teacher1')]").exists())
                .andExpect(jsonPath("$[?(@.username == 'otheradmin')]").doesNotExist());

        User created = userRepository.findByUsername("teacher1").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(CAREPOINT_ID, created.getSchoolId());
        org.junit.jupiter.api.Assertions.assertTrue(passwordEncoder.matches("temporary-password", created.getPasswordHash()));
        org.junit.jupiter.api.Assertions.assertEquals(1, auditRepository.count());
    }

    @Test
    void itAdminCannotReadOrUpdateAnotherSchoolsUser() throws Exception {
        mockMvc.perform(get(USERS_PATH + "/" + otherSchoolUserId)
                        .header("Authorization", bearer(itAdminToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(patch(USERS_PATH + "/" + otherSchoolUserId)
                        .header("Authorization", bearer(itAdminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"enabled\":false}"))
                .andExpect(status().isNotFound());

        org.junit.jupiter.api.Assertions.assertEquals(otherSchoolId,
                userRepository.findById(otherSchoolUserId).orElseThrow().getSchoolId());
    }

    @Test
    void nonItAdminAndItAdminRoleAssignmentAreRejected() throws Exception {
        User schoolAdmin = saveUser(CAREPOINT_ID, "principal", Role.ADMIN);
        mockMvc.perform(get(USERS_PATH).header("Authorization", bearer(jwtService.generateToken(schoolAdmin))))
                .andExpect(status().isForbidden());

        User platformOwner = saveUser(null, "platformowner", Role.SUPER_ADMIN);
        mockMvc.perform(get(USERS_PATH).header("Authorization", bearer(jwtService.generateToken(platformOwner))))
                .andExpect(status().isForbidden());

        mockMvc.perform(post(USERS_PATH)
                        .header("Authorization", bearer(itAdminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"second-it@example.com\",\"username\":\"secondit\",\"password\":\"temporary-password\",\"role\":\"IT_ADMIN\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void itAdminCanChangeRoleAndDisableAUserWithAudit() throws Exception {
        User teacher = saveUser(CAREPOINT_ID, "teacher2", Role.TEACHER);
        String teacherToken = jwtService.generateToken(teacher);
        refreshTokenService.createRefreshToken(teacher);
        String body = objectMapper.writeValueAsString(java.util.Map.of("role", "ADMIN", "enabled", false));

        mockMvc.perform(patch(USERS_PATH + "/" + teacher.getId())
                        .header("Authorization", bearer(itAdminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.enabled").value(false));

        org.junit.jupiter.api.Assertions.assertEquals(2, auditRepository.count());
        org.junit.jupiter.api.Assertions.assertTrue(refreshTokenRepository.findAllByUser_Id(teacher.getId()).stream()
                .allMatch(token -> token.getRevokedAt() != null));
        mockMvc.perform(get(USERS_PATH + "/" + teacher.getId()).header("Authorization", bearer(teacherToken)))
                .andExpect(status().isUnauthorized());
    }

    private User saveUser(UUID schoolId, String username, Role role) {
        User user = new User();
        user.setSchoolId(schoolId);
        user.setEmail(username + "@example.com");
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode("integration-test-password"));
        user.setRole(role);
        user.setEnabled(true);
        return userRepository.saveAndFlush(user);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
