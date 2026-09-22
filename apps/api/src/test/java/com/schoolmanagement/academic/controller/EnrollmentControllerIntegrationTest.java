package com.schoolmanagement.academic.controller;

import com.schoolmanagement.academic.domain.AcademicYear;
import com.schoolmanagement.academic.domain.SchoolClass;
import com.schoolmanagement.academic.dto.EnrollmentRequest;
import com.schoolmanagement.academic.repository.AcademicYearRepository;
import com.schoolmanagement.academic.repository.EnrollmentRepository;
import com.schoolmanagement.academic.repository.SchoolClassRepository;
import com.schoolmanagement.auth.domain.Role;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.repository.UserRepository;
import com.schoolmanagement.people.domain.Student;
import com.schoolmanagement.people.repository.StudentRepository;
import tools.jackson.databind.ObjectMapper;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public class EnrollmentControllerIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User admin;
    private Student student;
    private SchoolClass schoolClass;
    private AcademicYear academicYear;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        admin = new User();
        admin.setEmail("admin@test.com");
        admin.setUsername("admin");
        admin.setPasswordHash(passwordEncoder.encode("supersecret"));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        admin = userRepository.save(admin);

        student = new Student();
        student.setAdmissionNumber("STU001");
        student.setFirstName("John");
        student.setLastName("Dadzie");
        student.setDateOfBirth(LocalDate.of(2010, 1, 1));
        student = studentRepository.save(student);

        schoolClass = new SchoolClass();
        schoolClass.setName("Class 1");
        schoolClass.setLevel("L1");
        schoolClass = schoolClassRepository.save(schoolClass);

        academicYear = new AcademicYear();
        academicYear.setName("2026/2027");
        academicYear.setStartDate(LocalDate.of(2026, 9, 1));
        academicYear.setEndDate(LocalDate.of(2027, 7, 31));
        academicYear = academicYearRepository.save(academicYear);
    }

    @AfterEach
    void tearDown() {
        enrollmentRepository.deleteAll();
        studentRepository.deleteAll();
        schoolClassRepository.deleteAll();
        academicYearRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void enrollStudent_ValidRequest_Returns201() throws Exception {
        EnrollmentRequest request = new EnrollmentRequest(
                student.getId(),
                schoolClass.getId(),
                academicYear.getId()
        );

        mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void enrollStudent_Duplicate_Returns409() throws Exception {
        EnrollmentRequest request = new EnrollmentRequest(
                student.getId(),
                schoolClass.getId(),
                academicYear.getId()
        );

        mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void enrollStudent_AsTeacher_Returns403() throws Exception {
        User teacher = new User();
        teacher.setEmail("teacher@test.com");
        teacher.setUsername("teacher");
        teacher.setPasswordHash(passwordEncoder.encode("supersecret"));
        teacher.setRole(Role.TEACHER);
        teacher.setEnabled(true);
        teacher = userRepository.save(teacher);

        EnrollmentRequest request = new EnrollmentRequest(
                student.getId(),
                schoolClass.getId(),
                academicYear.getId()
        );

        mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(teacher))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void enrollStudent_ExceedsCapacity_Returns409() throws Exception {
        // Set capacity to 1
        schoolClass.setCapacity(1);
        schoolClass = schoolClassRepository.save(schoolClass);

        EnrollmentRequest request1 = new EnrollmentRequest(
                student.getId(),
                schoolClass.getId(),
                academicYear.getId()
        );

        // First enrollment should succeed
        mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());

        // Create second student
        Student student2 = new Student();
        student2.setAdmissionNumber("STU002");
        student2.setFirstName("Jane");
        student2.setLastName("Doe");
        student2.setDateOfBirth(LocalDate.of(2010, 2, 2));
        student2 = studentRepository.save(student2);

        EnrollmentRequest request2 = new EnrollmentRequest(
                student2.getId(),
                schoolClass.getId(),
                academicYear.getId()
        );

        // Second enrollment should fail due to capacity
        mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isConflict());
    }

    @Test
    void enrollStudent_ConcurrentRequests_RespectCapacity() throws Exception {
        schoolClass.setCapacity(1);
        schoolClass = schoolClassRepository.save(schoolClass);

        Student student2 = new Student();
        student2.setAdmissionNumber("STU002");
        student2.setFirstName("Jane");
        student2.setLastName("Doe");
        student2.setDateOfBirth(LocalDate.of(2010, 2, 2));
        student2 = studentRepository.save(student2);

        EnrollmentRequest request1 = new EnrollmentRequest(student.getId(), schoolClass.getId(), academicYear.getId());
        EnrollmentRequest request2 = new EnrollmentRequest(student2.getId(), schoolClass.getId(), academicYear.getId());

        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(2);
        java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);

        java.util.concurrent.Future<Integer> future1 = executor.submit(() -> {
            latch.await();
            return mockMvc.perform(post("/api/v1/enrollments")
                    .with(SecurityMockMvcRequestPostProcessors.user(admin))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request1)))
                    .andReturn().getResponse().getStatus();
        });

        java.util.concurrent.Future<Integer> future2 = executor.submit(() -> {
            latch.await();
            return mockMvc.perform(post("/api/v1/enrollments")
                    .with(SecurityMockMvcRequestPostProcessors.user(admin))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request2)))
                    .andReturn().getResponse().getStatus();
        });

        latch.countDown(); // Start both threads

        int status1 = future1.get();
        int status2 = future2.get();

        executor.shutdown();

        // Exactly one should succeed (201) and one should fail (409)
        org.junit.jupiter.api.Assertions.assertTrue(
                (status1 == 201 && status2 == 409) || (status1 == 409 && status2 == 201),
                "One request should succeed and the other should return 409 conflict, got: " + status1 + " and " + status2
        );

        long occupied = enrollmentRepository.countBySchoolClassIdAndStatusIn(
                schoolClass.getId(), java.util.List.of(com.schoolmanagement.academic.domain.EnrollmentStatus.ACTIVE, com.schoolmanagement.academic.domain.EnrollmentStatus.SUSPENDED));

        org.junit.jupiter.api.Assertions.assertEquals(1, occupied);
    }

    @Test
    void updateEnrollment_SuspendedConsumesCapacity_Returns409() throws Exception {
        schoolClass.setCapacity(1);
        schoolClass = schoolClassRepository.save(schoolClass);

        EnrollmentRequest request1 = new EnrollmentRequest(student.getId(), schoolClass.getId(), academicYear.getId());

        String responseJson = mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        com.schoolmanagement.academic.dto.EnrollmentResponse enrollment1 = objectMapper.readValue(responseJson, com.schoolmanagement.academic.dto.EnrollmentResponse.class);

        com.schoolmanagement.academic.dto.EnrollmentStatusUpdateRequest update =
            new com.schoolmanagement.academic.dto.EnrollmentStatusUpdateRequest(com.schoolmanagement.academic.domain.EnrollmentStatus.SUSPENDED);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/enrollments/{id}/status", enrollment1.id())
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk());

        Student student2 = new Student();
        student2.setAdmissionNumber("STU002");
        student2.setFirstName("Jane");
        student2.setLastName("Doe");
        student2.setDateOfBirth(LocalDate.of(2010, 2, 2));
        student2 = studentRepository.save(student2);

        EnrollmentRequest request2 = new EnrollmentRequest(student2.getId(), schoolClass.getId(), academicYear.getId());

        mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isConflict());
    }

    @Test
    void updateEnrollment_TransferredFreesCapacity_Returns201() throws Exception {
        schoolClass.setCapacity(1);
        schoolClass = schoolClassRepository.save(schoolClass);

        EnrollmentRequest request1 = new EnrollmentRequest(student.getId(), schoolClass.getId(), academicYear.getId());

        String responseJson = mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        com.schoolmanagement.academic.dto.EnrollmentResponse enrollment1 = objectMapper.readValue(responseJson, com.schoolmanagement.academic.dto.EnrollmentResponse.class);

        com.schoolmanagement.academic.dto.EnrollmentStatusUpdateRequest update =
            new com.schoolmanagement.academic.dto.EnrollmentStatusUpdateRequest(com.schoolmanagement.academic.domain.EnrollmentStatus.TRANSFERRED);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/enrollments/{id}/status", enrollment1.id())
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk());

        Student student2 = new Student();
        student2.setAdmissionNumber("STU003");
        student2.setFirstName("John");
        student2.setLastName("Smith");
        student2.setDateOfBirth(LocalDate.of(2010, 3, 3));
        student2 = studentRepository.save(student2);

        EnrollmentRequest request2 = new EnrollmentRequest(student2.getId(), schoolClass.getId(), academicYear.getId());

        mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated());
    }

    @Test
    void updateEnrollment_WithdrawnFreesCapacity_Returns201() throws Exception {
        schoolClass.setCapacity(1);
        schoolClass = schoolClassRepository.save(schoolClass);

        EnrollmentRequest request1 = new EnrollmentRequest(student.getId(), schoolClass.getId(), academicYear.getId());

        String responseJson = mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        com.schoolmanagement.academic.dto.EnrollmentResponse enrollment1 = objectMapper.readValue(responseJson, com.schoolmanagement.academic.dto.EnrollmentResponse.class);

        com.schoolmanagement.academic.dto.EnrollmentStatusUpdateRequest update =
            new com.schoolmanagement.academic.dto.EnrollmentStatusUpdateRequest(com.schoolmanagement.academic.domain.EnrollmentStatus.WITHDRAWN);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/enrollments/{id}/status", enrollment1.id())
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk());

        Student student2 = new Student();
        student2.setAdmissionNumber("STU004");
        student2.setFirstName("Alan");
        student2.setLastName("Turing");
        student2.setDateOfBirth(LocalDate.of(2010, 4, 4));
        student2 = studentRepository.save(student2);

        EnrollmentRequest request2 = new EnrollmentRequest(student2.getId(), schoolClass.getId(), academicYear.getId());

        mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated());
    }
}
