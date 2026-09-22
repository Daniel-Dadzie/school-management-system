package com.schoolmanagement.academic.controller;

import tools.jackson.databind.ObjectMapper;
import com.schoolmanagement.academic.domain.AcademicYear;
import com.schoolmanagement.academic.domain.SchoolClass;
import com.schoolmanagement.academic.domain.Subject;
import com.schoolmanagement.academic.domain.TeacherAssignment;
import com.schoolmanagement.academic.domain.Term;
import com.schoolmanagement.academic.dto.SchoolClassRequest;
import com.schoolmanagement.academic.repository.AcademicYearRepository;
import com.schoolmanagement.academic.repository.SchoolClassRepository;
import com.schoolmanagement.academic.repository.SubjectRepository;
import com.schoolmanagement.academic.repository.TeacherAssignmentRepository;
import com.schoolmanagement.academic.repository.TermRepository;
import com.schoolmanagement.auth.domain.Role;
import com.schoolmanagement.auth.domain.User;
import com.schoolmanagement.auth.repository.UserRepository;
import com.schoolmanagement.people.domain.Teacher;
import com.schoolmanagement.people.repository.TeacherRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
public class SchoolClassControllerIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private TeacherAssignmentRepository teacherAssignmentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private TermRepository termRepository;

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
        teacherAssignmentRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();
        schoolClassRepository.deleteAll();
        subjectRepository.deleteAll();
        termRepository.deleteAll();
        academicYearRepository.deleteAll();
    }

    private SchoolClassRequest validRequest() {
        return new SchoolClassRequest("Class 5A", "Primary 5", 30);
    }

    @Test
    void createClass_AsAdmin_Returns201() throws Exception {
        User admin = new User();
        admin.setEmail("admin@test.com");
        admin.setUsername("admin");
        admin.setPasswordHash("hash");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        mockMvc.perform(post("/api/v1/classes")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Class 5A"));
    }

    @Test
    void createClass_ZeroCapacity_Returns400() throws Exception {
        User admin = new User();
        admin.setEmail("admin2@test.com");
        admin.setUsername("admin2");
        admin.setPasswordHash("hash");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        SchoolClassRequest badRequest = new SchoolClassRequest("Class 5B", "Primary 5", 0);

        mockMvc.perform(post("/api/v1/classes")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void createClass_NegativeCapacity_Returns400() throws Exception {
        User admin = new User();
        admin.setEmail("admin3@test.com");
        admin.setUsername("admin3");
        admin.setPasswordHash("hash");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        SchoolClassRequest badRequest = new SchoolClassRequest("Class 5C", "Primary 5", -10);

        mockMvc.perform(post("/api/v1/classes")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    void createClass_OmittedCapacityRetainsDefault30_Returns201() throws Exception {
        User admin = new User();
        admin.setEmail("admin4@test.com");
        admin.setUsername("admin4");
        admin.setPasswordHash("hash");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        // Omit capacity by setting it to null (which uses default in Entity if logic allows, or we just pass it)
        SchoolClassRequest noCapacityRequest = new SchoolClassRequest("Class 5D", "Primary 5", null);

        mockMvc.perform(post("/api/v1/classes")
                        .with(SecurityMockMvcRequestPostProcessors.user(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noCapacityRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.capacity").value(30));
    }

    @Test
    void getClasses_AsTeacher_ReturnsOnlyAssignedClasses() throws Exception {
        SchoolClass classA = new SchoolClass();
        classA.setName("Class A");
        classA.setLevel("1");
        schoolClassRepository.save(classA);

        SchoolClass classB = new SchoolClass();
        classB.setName("Class B");
        classB.setLevel("1");
        schoolClassRepository.save(classB);

        User teacherUser = new User();
        teacherUser.setEmail("teacher@test.com");
        teacherUser.setUsername("teacher");
        teacherUser.setPasswordHash("hash");
        teacherUser.setRole(Role.TEACHER);
        teacherUser = userRepository.save(teacherUser);

        Teacher teacher = new Teacher();
        teacher.setUser(teacherUser);
        teacher.setStaffNumber("T001");
        teacher.setFirstName("John");
        teacher.setLastName("Doe");
        teacher.setPhone("123");
        teacher = teacherRepository.save(teacher);

        Subject subject = new Subject();
        subject.setName("Math");
        subject.setCode("M1");
        subject = subjectRepository.save(subject);

        AcademicYear year = new AcademicYear();
        year.setName("Year 1");
        year.setStartDate(LocalDate.now());
        year.setEndDate(LocalDate.now().plusMonths(6));
        year = academicYearRepository.save(year);

        Term term = new Term();
        term.setName("Term 1");
        term.setAcademicYear(year);
        term.setStartDate(LocalDate.now());
        term.setEndDate(LocalDate.now().plusMonths(3));
        term.setMandatory(true);
        term = termRepository.save(term);

        TeacherAssignment assignment = new TeacherAssignment();
        assignment.setTeacher(teacher);
        assignment.setSchoolClass(classA);
        assignment.setSubject(subject);
        assignment.setAcademicYear(year);
        assignment.setTerm(term);
        teacherAssignmentRepository.save(assignment);

        mockMvc.perform(get("/api/v1/classes")
                        .with(SecurityMockMvcRequestPostProcessors.user(teacherUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Class A"));
    }
}

