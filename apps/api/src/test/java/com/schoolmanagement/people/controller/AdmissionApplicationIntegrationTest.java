package com.schoolmanagement.people.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolmanagement.people.dto.AdmissionApplicationRequest;
import com.schoolmanagement.people.repository.AdmissionApplicationRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public class AdmissionApplicationIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AdmissionApplicationRepository repository;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }

    @AfterEach
    void tearDown() {
        repository.deleteAll();
    }

    private AdmissionApplicationRequest validRequest() {
        return new AdmissionApplicationRequest(
                "Kofi",
                "Mensah",
                LocalDate.of(2015, 5, 10),
                "MALE",
                "JSS 1",
                "Ama Mensah",
                "ama.mensah@example.com",
                "0241234567",
                "MOTHER",
                null
        );
    }

    @Test
    void submitApplication_ValidRequest_Returns201() throws Exception {
        mockMvc.perform(post("/api/v1/admissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.studentFirstName").value("Kofi"))
                .andExpect(jsonPath("$.studentLastName").value("Mensah"))
                .andExpect(jsonPath("$.parentEmail").value("ama.mensah@example.com"))
                .andExpect(jsonPath("$.submittedAt").exists());
    }

    @Test
    void submitApplication_IsPublic_NoAuthRequired() throws Exception {
        // Submitting without any Authorization header must succeed
        mockMvc.perform(post("/api/v1/admissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isCreated());
    }

    @Test
    void getAdmissions_IsProtected_RequiresAuth() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/admissions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void submitApplication_MissingStudentFirstName_Returns400() throws Exception {
        AdmissionApplicationRequest bad = new AdmissionApplicationRequest(
                "",            // blank first name
                "Mensah",
                LocalDate.of(2015, 5, 10),
                "MALE",
                "JSS 1",
                "Ama Mensah",
                "ama.mensah@example.com",
                "0241234567",
                "MOTHER",
                null
        );

        mockMvc.perform(post("/api/v1/admissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.studentFirstName").exists());
    }

    @Test
    void submitApplication_InvalidEmail_Returns400() throws Exception {
        AdmissionApplicationRequest bad = new AdmissionApplicationRequest(
                "Kofi",
                "Mensah",
                LocalDate.of(2015, 5, 10),
                "MALE",
                "JSS 1",
                "Ama Mensah",
                "not-an-email",   // invalid email
                "0241234567",
                "MOTHER",
                null
        );

        mockMvc.perform(post("/api/v1/admissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.parentEmail").exists());
    }

    @Test
    void submitApplication_InvalidGender_Returns400() throws Exception {
        AdmissionApplicationRequest bad = new AdmissionApplicationRequest(
                "Kofi",
                "Mensah",
                LocalDate.of(2015, 5, 10),
                "UNKNOWN",       // invalid gender
                "JSS 1",
                "Ama Mensah",
                "ama.mensah@example.com",
                "0241234567",
                "MOTHER",
                null
        );

        mockMvc.perform(post("/api/v1/admissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.gender").exists());
    }

    @Test
    void submitApplication_FutureDateOfBirth_Returns400() throws Exception {
        AdmissionApplicationRequest bad = new AdmissionApplicationRequest(
                "Kofi",
                "Mensah",
                LocalDate.now().plusYears(1),  // future date
                "MALE",
                "JSS 1",
                "Ama Mensah",
                "ama.mensah@example.com",
                "0241234567",
                "MOTHER",
                null
        );

        mockMvc.perform(post("/api/v1/admissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.dateOfBirth").exists());
    }

    @Test
    void submitApplication_InvalidRelationship_Returns400() throws Exception {
        AdmissionApplicationRequest bad = new AdmissionApplicationRequest(
                "Kofi",
                "Mensah",
                LocalDate.of(2015, 5, 10),
                "MALE",
                "JSS 1",
                "Ama Mensah",
                "ama.mensah@example.com",
                "0241234567",
                "UNCLE",         // not an accepted value
                null
        );

        mockMvc.perform(post("/api/v1/admissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.relationship").exists());
    }

    @Test
    void submitApplication_NullDateOfBirth_Returns400() throws Exception {
        String json = """
                {
                  "studentFirstName": "Kofi",
                  "studentLastName": "Mensah",
                  "dateOfBirth": null,
                  "gender": "MALE",
                  "applyingForClass": "JSS 1",
                  "parentName": "Ama Mensah",
                  "parentEmail": "ama.mensah@example.com",
                  "parentPhone": "0241234567",
                  "relationship": "MOTHER"
                }
                """;

        mockMvc.perform(post("/api/v1/admissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.dateOfBirth").exists());
    }
}
