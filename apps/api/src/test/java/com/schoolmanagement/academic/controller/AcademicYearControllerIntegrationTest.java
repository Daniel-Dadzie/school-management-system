package com.schoolmanagement.academic.controller;

import java.time.LocalDate;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.schoolmanagement.academic.domain.AcademicYear;
import com.schoolmanagement.academic.domain.AcademicYearStatus;
import com.schoolmanagement.academic.dto.AcademicYearRequest;
import com.schoolmanagement.academic.repository.AcademicYearRepository;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class AcademicYearControllerIntegrationTest {

    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AcademicYearRepository repository;

    @Autowired
    private com.schoolmanagement.academic.repository.TermRepository termRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @AfterEach
    void tearDown() {
        termRepository.deleteAll();
        repository.deleteAll();
    }

    private AcademicYearRequest validRequest() {
        return new AcademicYearRequest(
                "2026/2027",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2027, 7, 31)
        );
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createAcademicYear_AsAdmin_Returns201() throws Exception {
        mockMvc.perform(post("/api/v1/academic-years")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("2026/2027"))
                .andExpect(jsonPath("$.status").value("PLANNED"));
    }

    @Test
    @WithMockUser(roles = "TEACHER")
    void createAcademicYear_AsTeacher_Returns403() throws Exception {
        mockMvc.perform(post("/api/v1/academic-years")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    void createAcademicYear_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(post("/api/v1/academic-years")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createAcademicYear_InvalidDates_Returns400() throws Exception {
        AcademicYearRequest bad = new AcademicYearRequest(
                "2026",
                LocalDate.of(2027, 1, 1),
                LocalDate.of(2026, 1, 1)
        );

        mockMvc.perform(post("/api/v1/academic-years")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createAcademicYear_Duplicate_Returns409() throws Exception {
        AcademicYear year = new AcademicYear();
        year.setName("2026/2027");
        year.setStartDate(LocalDate.of(2026, 9, 1));
        year.setEndDate(LocalDate.of(2027, 7, 31));
        year.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year);

        mockMvc.perform(post("/api/v1/academic-years")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "TEACHER")
    void getAcademicYears_AsTeacher_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/academic-years"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateAcademicYearStatus_ValidTransition_Returns200() throws Exception {
        AcademicYear year = new AcademicYear();
        year.setName("2028");
        year.setStartDate(LocalDate.of(2028, 9, 1));
        year.setEndDate(LocalDate.of(2029, 7, 31));
        year.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year);

        com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest update =
            new com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest(AcademicYearStatus.ACTIVE);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/academic-years/{id}/status", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // Test ACTIVE -> COMPLETED
        com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest updateCompleted =
            new com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest(AcademicYearStatus.COMPLETED);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/academic-years/{id}/status", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateCompleted)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateAcademicYearStatus_SameStatus_Returns400() throws Exception {
        AcademicYear year = new AcademicYear();
        year.setName("2029");
        year.setStartDate(LocalDate.of(2029, 9, 1));
        year.setEndDate(LocalDate.of(2030, 7, 31));
        year.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year);

        com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest update =
            new com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest(AcademicYearStatus.PLANNED);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/academic-years/{id}/status", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateAcademicYearStatus_ActiveToPlanned_Returns400() throws Exception {
        AcademicYear year = new AcademicYear();
        year.setName("2030-A");
        year.setStartDate(LocalDate.of(2030, 9, 1));
        year.setEndDate(LocalDate.of(2031, 7, 31));
        year.setStatus(AcademicYearStatus.ACTIVE);
        repository.save(year);

        com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest update =
            new com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest(AcademicYearStatus.PLANNED);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/academic-years/{id}/status", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest());

        AcademicYear saved = repository.findById(year.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(AcademicYearStatus.ACTIVE, saved.getStatus());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateAcademicYearStatus_CompletedToPlanned_Returns400() throws Exception {
        AcademicYear year = new AcademicYear();
        year.setName("2030-B");
        year.setStartDate(LocalDate.of(2030, 9, 1));
        year.setEndDate(LocalDate.of(2031, 7, 31));
        year.setStatus(AcademicYearStatus.COMPLETED);
        repository.save(year);

        com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest update =
            new com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest(AcademicYearStatus.PLANNED);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/academic-years/{id}/status", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest());

        AcademicYear saved = repository.findById(year.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(AcademicYearStatus.COMPLETED, saved.getStatus());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateAcademicYearStatus_InvalidTransition_Returns400() throws Exception {
        AcademicYear year = new AcademicYear();
        year.setName("2030");
        year.setStartDate(LocalDate.of(2030, 9, 1));
        year.setEndDate(LocalDate.of(2031, 7, 31));
        year.setStatus(AcademicYearStatus.COMPLETED);
        repository.save(year);

        // COMPLETED -> ACTIVE should fail
        com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest update =
            new com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest(AcademicYearStatus.ACTIVE);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/academic-years/{id}/status", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest());

        AcademicYear saved = repository.findById(year.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(AcademicYearStatus.COMPLETED, saved.getStatus());
    }

    @Test
    @WithMockUser(roles = "TEACHER")
    void updateAcademicYearStatus_AsTeacher_Returns403() throws Exception {
        AcademicYear year = new AcademicYear();
        year.setName("2031");
        year.setStartDate(LocalDate.of(2031, 9, 1));
        year.setEndDate(LocalDate.of(2032, 7, 31));
        year.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year);

        com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest update =
            new com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest(AcademicYearStatus.ACTIVE);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/academic-years/{id}/status", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateAcademicYearStatus_SecondActive_Returns409() throws Exception {
        AcademicYear year1 = new AcademicYear();
        year1.setName("2032");
        year1.setStartDate(LocalDate.of(2032, 9, 1));
        year1.setEndDate(LocalDate.of(2033, 7, 31));
        year1.setStatus(AcademicYearStatus.ACTIVE);
        repository.save(year1);

        AcademicYear year2 = new AcademicYear();
        year2.setName("2033");
        year2.setStartDate(LocalDate.of(2033, 9, 1));
        year2.setEndDate(LocalDate.of(2034, 7, 31));
        year2.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year2);

        com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest update =
            new com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest(AcademicYearStatus.ACTIVE);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/academic-years/{id}/status", year2.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createTerm_ValidNonOverlapping_Returns201() throws Exception {
        AcademicYear year = new AcademicYear();
        year.setName("2034-NV");
        year.setStartDate(LocalDate.of(2034, 9, 1));
        year.setEndDate(LocalDate.of(2035, 7, 31));
        year.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year);

        com.schoolmanagement.academic.dto.TermRequest term1 = new com.schoolmanagement.academic.dto.TermRequest("Term 1", LocalDate.of(2034, 9, 1), LocalDate.of(2034, 12, 14), true);
        com.schoolmanagement.academic.dto.TermRequest term2 = new com.schoolmanagement.academic.dto.TermRequest("Term 2", LocalDate.of(2034, 12, 15), LocalDate.of(2035, 3, 15), true);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/academic-years/{id}/terms", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(term1)))
                .andExpect(status().isCreated());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/academic-years/{id}/terms", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(term2)))
                .andExpect(status().isCreated());

        long termCount = termRepository.findAll().stream().filter(t -> t.getAcademicYear().getId().equals(year.getId())).count();
        org.junit.jupiter.api.Assertions.assertEquals(2, termCount);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createTerm_OrdinaryOverlapping_Returns409() throws Exception {
        AcademicYear year = new AcademicYear();
        year.setName("2034-OO");
        year.setStartDate(LocalDate.of(2034, 9, 1));
        year.setEndDate(LocalDate.of(2035, 7, 31));
        year.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year);

        com.schoolmanagement.academic.dto.TermRequest term1 = new com.schoolmanagement.academic.dto.TermRequest("Term 1", LocalDate.of(2034, 1, 1), LocalDate.of(2034, 3, 31), true);
        com.schoolmanagement.academic.dto.TermRequest term2 = new com.schoolmanagement.academic.dto.TermRequest("Term 2", LocalDate.of(2034, 3, 1), LocalDate.of(2034, 5, 31), true);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/academic-years/{id}/terms", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(term1)))
                .andExpect(status().isCreated());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/academic-years/{id}/terms", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(term2)))
                .andExpect(status().isConflict());

        long termCount = termRepository.findAll().stream().filter(t -> t.getAcademicYear().getId().equals(year.getId())).count();
        org.junit.jupiter.api.Assertions.assertEquals(1, termCount);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createTerm_BoundarySharing_Returns409() throws Exception {
        AcademicYear year = new AcademicYear();
        year.setName("2034");
        year.setStartDate(LocalDate.of(2034, 9, 1));
        year.setEndDate(LocalDate.of(2035, 7, 31));
        year.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year);

        com.schoolmanagement.academic.dto.TermRequest term1 = new com.schoolmanagement.academic.dto.TermRequest("Term 1", LocalDate.of(2034, 9, 1), LocalDate.of(2034, 12, 15), true);
        com.schoolmanagement.academic.dto.TermRequest term2 = new com.schoolmanagement.academic.dto.TermRequest("Term 2", LocalDate.of(2034, 12, 15), LocalDate.of(2035, 3, 15), true); // Shares Dec 15

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/academic-years/{id}/terms", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(term1)))
                .andExpect(status().isCreated());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/academic-years/{id}/terms", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(term2)))
                .andExpect(status().isConflict());

        long termCount = termRepository.findAll().stream().filter(t -> t.getAcademicYear().getId().equals(year.getId())).count();
        org.junit.jupiter.api.Assertions.assertEquals(1, termCount, "Failed overlapping-term creation should not be persisted");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createTerm_DifferentAcademicYears_DoNotConflict() throws Exception {
        AcademicYear year1 = new AcademicYear();
        year1.setName("2036-Y1");
        year1.setStartDate(LocalDate.of(2036, 9, 1));
        year1.setEndDate(LocalDate.of(2037, 7, 31));
        year1.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year1);

        AcademicYear year2 = new AcademicYear();
        year2.setName("2037-Y2");
        year2.setStartDate(LocalDate.of(2037, 9, 1));
        year2.setEndDate(LocalDate.of(2038, 7, 31));
        year2.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year2);

        com.schoolmanagement.academic.dto.TermRequest term1 = new com.schoolmanagement.academic.dto.TermRequest("Term 1", LocalDate.of(2036, 9, 1), LocalDate.of(2036, 12, 15), true);
        com.schoolmanagement.academic.dto.TermRequest term2 = new com.schoolmanagement.academic.dto.TermRequest("Term 2", LocalDate.of(2036, 9, 1), LocalDate.of(2036, 12, 15), true);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/academic-years/{id}/terms", year1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(term1)))
                .andExpect(status().isCreated());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/academic-years/{id}/terms", year2.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(term2)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createTerm_InvalidDates_Returns400() throws Exception {
        AcademicYear year = new AcademicYear();
        year.setName("2038-ID");
        year.setStartDate(LocalDate.of(2038, 9, 1));
        year.setEndDate(LocalDate.of(2039, 7, 31));
        year.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year);

        com.schoolmanagement.academic.dto.TermRequest term1 = new com.schoolmanagement.academic.dto.TermRequest("Term 1", LocalDate.of(2038, 12, 15), LocalDate.of(2038, 9, 1), true);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/academic-years/{id}/terms", year.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(term1)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateAcademicYearStatus_ConcurrentActivation_OnlyOneSucceeds() throws Exception {
        final AcademicYear year1 = new AcademicYear();
        year1.setName("2040");
        year1.setStartDate(LocalDate.of(2040, 9, 1));
        year1.setEndDate(LocalDate.of(2041, 7, 31));
        year1.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year1);

        final AcademicYear year2 = new AcademicYear();
        year2.setName("2041");
        year2.setStartDate(LocalDate.of(2041, 9, 1));
        year2.setEndDate(LocalDate.of(2042, 7, 31));
        year2.setStatus(AcademicYearStatus.PLANNED);
        repository.save(year2);

        com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest update =
            new com.schoolmanagement.academic.dto.AcademicYearStatusUpdateRequest(AcademicYearStatus.ACTIVE);

        final String payload = objectMapper.writeValueAsString(update);

        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(2);
        java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);

        java.util.concurrent.Future<Integer> future1 = executor.submit(() -> {
            latch.await();
            return mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/academic-years/{id}/status", year1.getId())
                    .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andReturn().getResponse().getStatus();
        });

        java.util.concurrent.Future<Integer> future2 = executor.submit(() -> {
            latch.await();
            return mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/academic-years/{id}/status", year2.getId())
                    .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andReturn().getResponse().getStatus();
        });

        latch.countDown(); // Start both threads

        int status1 = future1.get();
        int status2 = future2.get();

        executor.shutdown();

        // Exactly one should succeed (200) and one should fail (409)
        org.junit.jupiter.api.Assertions.assertTrue(
                (status1 == 200 && status2 == 409) || (status1 == 409 && status2 == 200),
                "One request should succeed and the other should return 409 conflict, got: " + status1 + " and " + status2
        );

        long activeCount = repository.findAll().stream().filter(y -> y.getStatus() == AcademicYearStatus.ACTIVE).count();
        long plannedCount = repository.findAll().stream().filter(y -> y.getStatus() == AcademicYearStatus.PLANNED).count();

        org.junit.jupiter.api.Assertions.assertEquals(1, activeCount, "Exactly one should be ACTIVE");
        org.junit.jupiter.api.Assertions.assertEquals(1, plannedCount, "The losing request should remain PLANNED");
    }
}

