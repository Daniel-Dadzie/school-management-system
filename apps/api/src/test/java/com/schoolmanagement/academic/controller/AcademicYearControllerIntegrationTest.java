package com.schoolmanagement.academic.controller;

import tools.jackson.databind.ObjectMapper;
import com.schoolmanagement.academic.domain.AcademicYear;
import com.schoolmanagement.academic.domain.AcademicYearStatus;
import com.schoolmanagement.academic.dto.AcademicYearRequest;
import com.schoolmanagement.academic.repository.AcademicYearRepository;
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
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public class AcademicYearControllerIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AcademicYearRepository repository;

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
}

