package com.schoolmanagement.people.controller;

import tools.jackson.databind.ObjectMapper;
import com.schoolmanagement.people.dto.AdmissionApplicationRequest;
import com.schoolmanagement.people.dto.AdmissionStatusUpdateRequest;
import com.schoolmanagement.people.domain.AdmissionStatus;
import com.schoolmanagement.people.domain.AdmissionApplication;
import com.schoolmanagement.people.repository.AdmissionApplicationRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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

    private AdmissionApplication createApplication() {
        AdmissionApplication app = new AdmissionApplication();
        app.setStudentFirstName("Kofi");
        app.setStudentLastName("Mensah");
        app.setDateOfBirth(LocalDate.of(2015, 5, 10));
        app.setGender("MALE");
        app.setApplyingForClass("JSS 1");
        app.setParentName("Ama Mensah");
        app.setParentEmail("ama.mensah@example.com");
        app.setParentPhone("0241234567");
        app.setRelationship("MOTHER");
        app.setStatus(AdmissionStatus.PENDING);
        return repository.save(app);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllApplications_AsAdmin_ReturnsList() throws Exception {
        createApplication();
        mockMvc.perform(get("/api/v1/admissions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].studentFirstName").value("Kofi"));
    }

    @Test
    @WithMockUser(roles = "SUPER_ADMIN")
    void getAllApplications_AsSuperAdmin_ReturnsList() throws Exception {
        createApplication();
        mockMvc.perform(get("/api/v1/admissions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "TEACHER")
    void getAllApplications_AsTeacher_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/admissions"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getApplicationById_AsAdmin_ReturnsApp() throws Exception {
        AdmissionApplication app = createApplication();
        mockMvc.perform(get("/api/v1/admissions/" + app.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(app.getId().toString()))
                .andExpect(jsonPath("$.studentFirstName").value("Kofi"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getApplicationById_NotFound_Returns404() throws Exception {
        mockMvc.perform(get("/api/v1/admissions/" + UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateApplicationStatus_AsAdmin_UpdatesStatus_ValidTransitions() throws Exception {
        AdmissionApplication app = createApplication();

        // PENDING -> UNDER_REVIEW
        AdmissionStatusUpdateRequest updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.UNDER_REVIEW);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNDER_REVIEW"));

        // UNDER_REVIEW -> APPROVED
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.APPROVED);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateApplicationStatus_AsAdmin_InvalidTransitions_Returns400() throws Exception {
        AdmissionApplication app = createApplication(); // PENDING

        // PENDING -> APPROVED (Invalid)
        AdmissionStatusUpdateRequest updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.APPROVED);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());

        // PENDING -> REJECTED (Invalid)
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.REJECTED);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());

        // Transition to UNDER_REVIEW to test further rules
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.UNDER_REVIEW);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk());

        // UNDER_REVIEW -> PENDING (Invalid)
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.PENDING);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());

        // Transition to APPROVED
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.APPROVED);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk());

        // APPROVED -> PENDING (Invalid)
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.PENDING);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());

        // APPROVED -> UNDER_REVIEW (Invalid)
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.UNDER_REVIEW);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());

        // APPROVED -> REJECTED (Invalid)
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.REJECTED);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateApplicationStatus_SameStatus_Returns400() throws Exception {
        AdmissionApplication app = createApplication(); // PENDING

        // PENDING -> PENDING (Invalid)
        AdmissionStatusUpdateRequest updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.PENDING);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());

        // Move to UNDER_REVIEW
        app.setStatus(AdmissionStatus.UNDER_REVIEW);
        repository.save(app);

        // UNDER_REVIEW -> UNDER_REVIEW (Invalid)
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.UNDER_REVIEW);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());

        // Move to APPROVED
        app.setStatus(AdmissionStatus.APPROVED);
        repository.save(app);

        // APPROVED -> APPROVED (Invalid)
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.APPROVED);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());

        // Move to REJECTED (bypassing normal flow via repository)
        app.setStatus(AdmissionStatus.REJECTED);
        repository.save(app);

        // REJECTED -> REJECTED (Invalid)
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.REJECTED);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateApplicationStatus_RejectedIsTerminal_Returns400() throws Exception {
        AdmissionApplication app = createApplication(); // PENDING
        app.setStatus(AdmissionStatus.UNDER_REVIEW);
        repository.save(app);

        AdmissionStatusUpdateRequest updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.REJECTED);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk());

        // REJECTED -> UNDER_REVIEW (Invalid)
        updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.UNDER_REVIEW);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "TEACHER")
    void updateApplicationStatus_AsTeacher_Returns403() throws Exception {
        AdmissionApplication app = createApplication();
        AdmissionStatusUpdateRequest updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.UNDER_REVIEW);

        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateApplicationStatus_InvalidStatus_Returns400() throws Exception {
        AdmissionApplication app = createApplication();

        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.status").exists());
    }
    @Test
    @WithMockUser(roles = "ADMIN")
    void updateApplicationStatus_NotFound_Returns404() throws Exception {
        AdmissionStatusUpdateRequest updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.UNDER_REVIEW);
        mockMvc.perform(patch("/api/v1/admissions/" + UUID.randomUUID() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "SUPER_ADMIN")
    void updateApplicationStatus_AsSuperAdmin_UpdatesStatus() throws Exception {
        AdmissionApplication app = createApplication();
        AdmissionStatusUpdateRequest updateReq = new AdmissionStatusUpdateRequest(AdmissionStatus.UNDER_REVIEW);
        mockMvc.perform(patch("/api/v1/admissions/" + app.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk());
    }
}
