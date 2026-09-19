package com.schoolmanagement.academic.controller;

import tools.jackson.databind.ObjectMapper;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
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
        admin.setPasswordHash("hash");
        admin.setRole(Role.ADMIN);
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

        // First enrollment
        mockMvc.perform(post("/api/v1/enrollments")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Second enrollment should fail
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
        teacher.setPasswordHash("hash");
        teacher.setRole(Role.TEACHER);
        userRepository.save(teacher);

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
}

