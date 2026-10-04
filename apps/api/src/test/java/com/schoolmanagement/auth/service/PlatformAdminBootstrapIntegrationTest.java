package com.schoolmanagement.auth.service;

import com.schoolmanagement.auth.domain.Role;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "PLATFORM_SUPER_ADMIN_EMAIL=platform-owner@example.test",
        "PLATFORM_SUPER_ADMIN_USERNAME=PLATFORM-OWNER",
        "PLATFORM_SUPER_ADMIN_INITIAL_PASSWORD=temporary-platform-password"
})
@Testcontainers
@ActiveProfiles("test")
class PlatformAdminBootstrapIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private UserRepository users;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PlatformAdminBootstrap bootstrap;

    @Value("${local.server.port}")
    private int localServerPort;

    @BeforeEach
    void resetInitialOwnerForEachTest() {
        User owner = users.findByEmail("platform-owner@example.test").orElseThrow();
        owner.setPasswordHash(passwordEncoder.encode("temporary-platform-password"));
        owner.setPasswordChangeRequired(true);
        users.saveAndFlush(owner);
    }

    @Test
    void startupCreatesGlobalHashedOwnerAndRerunDoesNotResetCredentials() throws Exception {
        User owner = users.findByEmail("platform-owner@example.test").orElseThrow();
        assertEquals("platform-owner", owner.getUsername());
        assertEquals(Role.SUPER_ADMIN, owner.getRole());
        assertNull(owner.getSchoolId());
        assertTrue(owner.isPasswordChangeRequired());
        assertTrue(passwordEncoder.matches("temporary-platform-password", owner.getPasswordHash()));

        String initialHash = owner.getPasswordHash();
        ApplicationArguments args = new DefaultApplicationArguments(new String[0]);
        bootstrap.run(args);

        User unchanged = users.findByEmail("platform-owner@example.test").orElseThrow();
        assertEquals(initialHash, unchanged.getPasswordHash());
        assertTrue(unchanged.isPasswordChangeRequired());
    }

    @Test
    void initialPasswordMustChangeBeforePlatformEndpointsAreAvailable() throws Exception {
        HttpResponse<String> login = send("POST", "/api/v1/auth/login",
                "{\"identifier\":\"platform-owner\",\"password\":\"temporary-platform-password\"}", null);
        assertEquals(200, login.statusCode());
        assertTrue(login.body().contains("\"passwordChangeRequired\":true"));
        Matcher tokenMatch = Pattern.compile("\\\"accessToken\\\":\\\"([^\\\"]+)\\\"").matcher(login.body());
        assertTrue(tokenMatch.find(), "login response should include an access token");
        String token = tokenMatch.group(1);

        String schoolRequest = "{\"name\":\"Bootstrap Test School\",\"slug\":\"bootstrap-test-school\","
                + "\"administratorEmail\":\"it@bootstrap-test-school.example\","
                + "\"administratorUsername\":\"bootstrap-it\",\"temporaryPassword\":\"school-temporary-password\"}";
        assertEquals(403, send("POST", "/api/v1/platform/schools", schoolRequest, token).statusCode());

        String changeRequest = "{\"currentPassword\":\"temporary-platform-password\","
                + "\"newPassword\":\"a-new-platform-password-2026\"}";
        assertEquals(204, send("POST", "/api/v1/auth/change-password", changeRequest, token).statusCode());
        assertEquals(201, send("POST", "/api/v1/platform/schools", schoolRequest, token).statusCode());
    }

    private HttpResponse<String> send(String method, String path, String body, String token) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(
                URI.create("http://localhost:" + localServerPort + path))
                .header("Content-Type", "application/json");
        if (token != null) request.header("Authorization", "Bearer " + token);
        request.method(method, HttpRequest.BodyPublishers.ofString(body));
        return HttpClient.newHttpClient().send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
}
