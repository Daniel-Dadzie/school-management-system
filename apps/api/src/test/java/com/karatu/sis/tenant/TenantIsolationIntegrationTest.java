package com.karatu.sis.tenant;

import tools.jackson.databind.ObjectMapper;
import com.karatu.sis.academic.domain.AcademicYear;
import com.karatu.sis.academic.domain.AcademicYearStatus;
import com.karatu.sis.academic.repository.AcademicYearRepository;
import com.karatu.sis.auth.domain.Role;
import com.karatu.sis.auth.domain.User;
import com.karatu.sis.auth.repository.UserRepository;
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
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public class TenantIsolationIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    private School schoolA;
    private School schoolB;
    private User adminA;
    private User adminB;
    private AcademicYear academicYearSchoolA;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // Create School A
        schoolA = new School();
        schoolA.setName("School A");
        schoolA.setSlug("school-a");
        schoolA.setActive(true);
        schoolA = schoolRepository.save(schoolA);

        // Create School B
        schoolB = new School();
        schoolB.setName("School B");
        schoolB.setSlug("school-b");
        schoolB.setActive(true);
        schoolB = schoolRepository.save(schoolB);

        // Create Admin for School A
        adminA = new User();
        adminA.setEmail("adminA@schoola.com");
        adminA.setUsername("adminA");
        adminA.setPasswordHash(passwordEncoder.encode("supersecret"));
        adminA.setRole(Role.ADMIN);
        adminA.setEnabled(true);
        adminA.setSchoolId(schoolA.getId());
        adminA = userRepository.save(adminA);

        // Create Admin for School B
        adminB = new User();
        adminB.setEmail("adminB@schoolb.com");
        adminB.setUsername("adminB");
        adminB.setPasswordHash(passwordEncoder.encode("supersecret"));
        adminB.setRole(Role.ADMIN);
        adminB.setEnabled(true);
        adminB.setSchoolId(schoolB.getId());
        adminB = userRepository.save(adminB);

        // Set TenantContext to School A to save tenant-owned data
        TenantContext.setSchoolId(schoolA.getId());

        academicYearSchoolA = new AcademicYear();
        academicYearSchoolA.setName("2026/2027 A");
        academicYearSchoolA.setStartDate(LocalDate.of(2026, 9, 1));
        academicYearSchoolA.setEndDate(LocalDate.of(2027, 7, 31));
        academicYearSchoolA.setStatus(AcademicYearStatus.PLANNED);
        academicYearSchoolA = academicYearRepository.save(academicYearSchoolA);
        
        TenantContext.clear();
    }

    @AfterEach
    void tearDown() {
        // Clear everything
        TenantContext.setSchoolId(schoolA.getId());
        academicYearRepository.deleteAll();
        TenantContext.clear();
        
        userRepository.deleteAll();
        schoolRepository.deleteAll();
        TenantContext.clear();
    }

    @Test
    void crossTenantAccess_PatchAcademicYearStatus_Returns404NotFound() throws Exception {
        // Try to update School A's Academic Year using School B's Admin User
        
        Map<String, String> request = Map.of("status", "ACTIVE");

        // The SecurityMockMvcRequestPostProcessors.user() bypasses JwtAuthenticationFilter,
        // so we manually set the ThreadLocal that the filter would normally set
        TenantContext.setSchoolId(schoolB.getId());

        try {
            mockMvc.perform(patch("/api/v1/academic-years/" + academicYearSchoolA.getId() + "/status")
                            .with(SecurityMockMvcRequestPostProcessors.user(adminB))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        } finally {
            TenantContext.clear();
        }
    }

    @Test
    void sameTenantAccess_PatchAcademicYearStatus_Returns200Ok() throws Exception {
        // Update School A's Academic Year using School A's Admin User
        
        Map<String, String> request = Map.of("status", "ACTIVE");

        TenantContext.setSchoolId(schoolA.getId());

        try {
            mockMvc.perform(patch("/api/v1/academic-years/" + academicYearSchoolA.getId() + "/status")
                            .with(SecurityMockMvcRequestPostProcessors.user(adminA))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        } finally {
            TenantContext.clear();
        }
    }
}
